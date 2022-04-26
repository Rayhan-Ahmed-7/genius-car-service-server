const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
    //console.log('inside verifyJWT',authHeader);
}

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
        const orderCollection = client.db('geniusCar').collection('order');
        console.log("user connected");

        //auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        //all user read
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        //single user read
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        //post 
        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })
        //delete user 
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })
        //order collection
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            //your order will be showen to you by verifiying your email
            if (email === decodedEmail) {
                const query = { email: email };
                console.log(email);
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }else{
                res.status(403).send({message:'forbidden access'}); 
            }
        })
        
        //order collection api
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })
    }
    finally {
        //await client.close();
    }
}

run().catch(console.dir);



app.listen(port, () => {
    console.log("server started");
})
