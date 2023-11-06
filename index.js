const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    const productCollection = client.db('bitJobs').collection('product');
    // const bookingCollection = client.db('carDoctor').collection('bookings');
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

    app.post('/api/user/create-product', async(req, res) => {
      const product = req.body; console.log(product);
      const result = await productCollection.insertOne(product);
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