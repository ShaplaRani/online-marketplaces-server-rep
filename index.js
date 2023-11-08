const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors({
  origin:[
    'https://redundant-bread.surge.sh',
    'https://online-marketplace-4abba.web.app',
    'https://online-marketplace-4abba.firebaseapp.com'
  ],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ei0qpxt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//middleware
const verifyToken = async(req, res, next) => {
  const token = req?.cookies?.token;
  //console.log(' token  in the middleware', token);
  if(!token){
      return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
      }
      //if token is valid then it would be decoded
      // console.log('value in the token', decoded);
        req.user = decoded;
      next();
  })
  
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // const bookingCollection = client.db('carDoctor').collection('bookings');
    const productCollection = client.db('bitJobs').collection('product');
    const jobCollection = client.db('bitJobs').collection('bJob');
 

  //jwt related api
  app.post('/jwt', async(req, res) => {
    const user = req.body;
   // console.log('user for token', user);
    //token create
     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    // console.log('token', token);
    // res
    res.cookie(
        "token",
        token,
        {
            httpOnly: true,
            secure:true,
            sameSite:'none'
           
        }
    )
    .send({success: true})
    //res.send({token})
 })
    //token delete
     app.post('/logout', async( req, res) =>{
     const user = req.body;
    //console.log("logging out", user);
     
     res.clearCookie('token', {maxAge: 0}).send({success: true})
  
})

    //job related api
    app.get('/api/category-product', async(req, res) => {
      let queryObj = {};
      const category = req.query.category;
      if(category){
        queryObj.category = category;
      }
      const cursor = productCollection.find(queryObj);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/api/email-product',verifyToken, async(req, res) => {
     
      console.log('token owner',req.user);
      const email = req.query.email;
      if(req.user.email !== email){
        return res.status(403).send({ message: 'forbidden access' })
      }
      let queryObj = {};
      if(email ){
        queryObj.email  = email ;
      }
      const cursor = productCollection.find(queryObj);
      const result = await cursor.toArray();
      res.send(result);
    })

    //single data get
    app.get("/api/email-product/:id", async(req, res)=>{
      const id = req.params.id;
       const query= {_id: new ObjectId(id)}
       const result = await productCollection.findOne(query)
      res.send(result)

  })

    app.post('/api/user/create-product', async(req, res) => {
      const product = req.body; console.log(product);
      const result = await productCollection.insertOne(product);
      res.send(result);
  })

  app.put('/api/update-product/:id', async(req, res) => {
    const id =  req.params.id;
    console.log(id);
         const updateJob = req.body;
         const filter= {_id: new ObjectId(id)}
         const option = {upsert: true}
        const job = {
         $set: {
          title:updateJob.title,
          category:updateJob.category,
           date:updateJob.date,
           maxPrice:updateJob.maxPrice,
           minPrice:updateJob.minPrice,
           description:updateJob.description
          
           
         }
        }
        const result = await productCollection.updateOne(filter, job, option)
        res.send(result)
  })

  app.delete("/api/email-product/:id", async(req, res)=>{
    const id = req.params.id;
    console.log(id);
    const query= {_id: new ObjectId(id)}
    console.log(query);
    const result = await productCollection.deleteOne(query)
    console.log(result);
    res.send(result)

})

//bit job relate api


app.get('/api/user-email',verifyToken, async(req, res) => {
  
  const email = req.query.email;

  if(req.user.email !== email){
    return res.status(403).send({ message: 'forbidden access' })
  }

  let queryObj = {};
  //sorting
  const sortObj ={};
  const sortField = req.query.sortField;
  const sortOrder = req.query.sortOrder;
  if(sortField && sortOrder){
    sortObj[sortField] = sortOrder
  }
  //
  if(email ){
    queryObj.userEmail  = email ;
  }

  const cursor = jobCollection.find(queryObj).sort(sortObj);
  const result = await cursor.toArray();
  res.send(result);
})
app.get('/api/buyer-email',verifyToken, async(req, res) => {
  
  const email = req.query.email;

  if(req.user.email !== email){
    return res.status(403).send({ message: 'forbidden access' })
  }

  let queryObj = {};
  if(email ){
    queryObj.buyerEmail  = email ;
  }
  const cursor = jobCollection.find(queryObj);
  const result = await cursor.toArray();
  res.send(result);
})
  
    app.post('/api/user/create-bitJob', async(req, res) => {
    const product = req.body; console.log(product);
    const result = await jobCollection.insertOne(product);
     res.send(result);
})
//update accept
app.put('/api/update-status/:id', async(req, res) => {
  const id = req.params.id;
  const filter = {_id : new ObjectId(id)}
  const updateJob = req.body;
  console.log(updateJob);
  const updateDoc = {
      $set : {
          status: updateJob.status,
          request:updateJob.request 
      }
  }

  const result = await  jobCollection.updateOne(filter, updateDoc);
  console.log(result);
  res.send(result);
}) 
//update complete
app.patch('/api/delete-complete/:id', async(req, res) => {
  const id = req.params.id;
  const filter = {_id : new ObjectId(id)}
  const updateJob = req.body;
  console.log(updateJob);
  const updateDoc = {
      $set : {
        complete: updateJob.complete
      }
  }

  const result = await  jobCollection.updateOne(filter, updateDoc);
  console.log(result);
  res.send(result);
}) 

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('online marketplaces is running');

})

app.listen(port , ()=> {
    console.log(`online marketplace is running no port: ${port}`);
})