const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Coffee server is getting hotter');
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqpiihv.mongodb.net/coffeeDB?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const coffeesCollection = client.db('coffeeDb').collection('coffees');

    const usersCollection = client.db('coffeeDb').collection('users');


    app.get('/coffees', async(req, res) => {
        // const cursor = coffeesCollection.find();
        // const result = await cursor.toArray();
        const result = await coffeesCollection.find().toArray();
        res.send(result);
    })

    app.get('/coffees/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await coffeesCollection.findOne(query);
      res.send(result);
    })

    app.post('/coffees', async(req, res) => {
        const newCoffee = req.body;
        console.log(newCoffee);
        const result = await coffeesCollection.insertOne(newCoffee);
        res.send(result);
    })

    app.put('/coffees/:id', async (req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updateCoffee = req.body;
      const updateDoc = {
        $set: updateCoffee
      }
      const result = await coffeesCollection.updateOne(filter, updateDoc, options);
      res.send(result); 
      
    })

    app.delete('/coffees/:id', async (req, res) =>{
      const id = req.params.id;
      const query ={_id:new ObjectId(id)}
      const result = await coffeesCollection.deleteOne(query);
      res.send(result);
    })

    // User related data
    app.post('/users', async(req, res) =>{
      const userProfile = req.body;
      const result = await usersCollection.insertOne(userProfile);
      res.send(result);
      console.log(userProfile);
    })

    app.get('/users', async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    app.patch('/users', async(req, res) => {
      const {email, lastSignInTime} = req.body
      const filter = {email: email}
      const updatedDoc = {
        $set: {
          lastSignInTime: lastSignInTime
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete('/users/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id:new ObjectId(id)}
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })

    await client.db("coffeeDB").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.log(error);
  }
}
run();

app.listen(port, () => {
    console.log(`Coffee server is running on port ${port}`);
})
