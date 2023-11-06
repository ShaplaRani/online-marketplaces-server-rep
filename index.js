const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ei0qpxt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // const bookingCollection = client.db('carDoctor').collection('bookings');
    const productCollection = client.db('bitJobs').collection('product');
    const jobCollection = client.db('bitJobs').collection('bJob');
  //   app.get("/api/product", async(req, res)=> { 
  //     const cursor = productCollection.find();
  //   const result = await cursor.toArray()
  //   res.send(result)
  // })

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

    app.get('/api/email-product', async(req, res) => {
      let queryObj = {};
      const email = req.query.email;
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
app.get('/api/user-email', async(req, res) => {
  let queryObj = {};
  const email = req.query.email;
  if(email ){
    queryObj.userEmail  = email ;
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