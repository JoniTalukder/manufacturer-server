const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

require('dotenv').config();


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jnicq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db('manufacturer_co').collection('parts');
        const purchaseCollection = client.db('manufacturer_co').collection('purchase');
        const userCollection = client.db('manufacturer_co').collection('users');

        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

        app.get('/parts/:id', async(req, res) =>{
            const id = req.params.id;
            const query={_id: ObjectId(id)};
            const result = await partsCollection.findOne(query);
            res.send(result);
        });

        
        // Get Part ID
        app.get('/parts/:id', async(req, res) =>{
            const id = req.params.id;
            const query={_id: ObjectId(id)};
            const result = await partsCollection.findOne(query);
            res.send(result);
        });

        // Update User

        app.put('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const updatedPart = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: updatedPart.name,
                    min_qty: updatedPart.min_qty,
                    available_qty: updatedPart.available_qty,
                }
            };
            const result = await partsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        });

        app.post('/purchase', async (req, res) => {
            const purchase = req.body;
            const result = await purchaseCollection.insertOne(purchase);
            res.send(result);
        });

        app.get('/purchase', async (req, res) => {
            const email= req.query.email;
            const query = { email: email };
            const purchase = await purchaseCollection.find(query).toArray();
            res.send(purchase);
        })





        

        



    }
    finally {

    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Running Simple Manufacturer Co')
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})