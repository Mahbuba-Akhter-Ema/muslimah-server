const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.trknobu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Un Authorized user!!' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_TOKEN, function (error, decoded) {
        if (error) {
            return res.status(401).send({ message: 'Un Authorized user!!' })
        }
        req.decoded = decoded;
        next();

    })
};

async function run() {
    try {
        const serviceCollection = client.db('muslimah').collection('services');
        const reviewCollection = client.db('muslimah').collection('review')
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = await serviceCollection.find(query);
            const service = await cursor.limit(3).toArray();
            res.send(service);
        });
        app.get('/allService', async (req, res) => {
            const query = {};
            const cursor = await serviceCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        });
        app.get('/allService/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });

        app.get("/review", async (req, res) => {
            let query = {};

            if (req.query.serviceID) {
                query = { serviceID: req.query.serviceID };
            }

            const cursor = await reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // post review......
        app.post("/review", async (req, res) => {
            const review = req.body;
            const cursor = await reviewCollection.insertOne(review);
            res.send(cursor);
        });
        app.get("/myReview", verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                res.send({ message: 'Un Authorized User!!' })
            };
            let query = {};
            if (req.query.email) {
                query = { email: req.query.email };
            }
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/myReview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await reviewCollection.findOne(query);
            res.send(service);
        });
        app.post("/service", async (req, res) => {
            const product = req.body;
            const result = await serviceCollection.insertOne(product);
            res.send(result);
        });
        //  Delete 
        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        });

        // Edit Review
        app.put('/myReview/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;
            const option = { upsert: true };

            const updateUser = {
                $set: {
                    message: user.message
                }
            }

            const updateReview = await reviewCollection.updateOne(filter, updateUser, option)

            res.send(updateReview)
        });

        // JWT Token 
        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log(user.email);
            const token = jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: '1d' })
            res.send({ token })

        })
    }
    finally {

    }
}
run().catch(err => console.log(err));


app.get('/', (req, res) => {
    res.send('Muslimah Server Running!');
});

app.listen(port, () => {
    console.log(`Muslimah Server listening on ${port}`);
})
