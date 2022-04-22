const express = require("express");
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("running genius server");
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w9sls.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect()
        const serviceCollection = client.db("geniusCar").collection("service");
        console.log("user connected");
        //all user read
        app.get('/service',async(req,res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        //single user read
        app.get('/service/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        //post 
        app.post('/service',async(req,res)=>{
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })
        //delete user 
        app.delete('/service/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally{
        //await client.close();
    }
}

run().catch(console.dir);



app.listen(port, () => {
    console.log("server started");
})
