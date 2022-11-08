const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.trknobu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try{
        const serviceCollection = client.db('muslimah').collection('services');
        app.get('/services', async(req, res)=>{
            const query={};
            const cursor=await serviceCollection.find(query);
            const service= await cursor.limit(3).toArray();
            res.send(service);
        });         
        app.get('/allService', async(req, res)=>{
            const query={};
            const cursor=await serviceCollection.find(query);
            const service= await cursor.toArray();
            res.send(service);
        }); 
        app.get('/allService/:id', async(req, res)=>{
            const id = req.params.id;
            const query={_id:ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        });       
    }
    finally{
       
    }
}
run().catch(err => console.log(err));


app.get('/', (req, res)=>{
    res.send('Muslimah Server Running!');
});

app.listen(port, () => {
        console.log(`Muslimah Server listening on ${port}`);
})
