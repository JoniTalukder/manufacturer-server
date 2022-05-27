const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

require('dotenv').config();


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jnicq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db('manufacturer_co').collection('parts');
        const purchaseCollection = client.db('manufacturer_co').collection('purchase');
        const userCollection = client.db('manufacturer_co').collection('users');
        const reviewCollection = client.db('manufacturer_co').collection('review');




        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        // app.get('/service/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await productCollection.findOne(query);
        //     res.send(result);
        // });

        // // Add Review
        app.post('/review', async (req, res) => {
            const newProduct = req.body;
            const result = await reviewCollection.insertOne(newProduct);
        })








        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray();
            res.send(parts);
        });

        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
            
        });

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        });

        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        }
            else{
              res.status(403).send({message: 'forbidden'});
            }
      
         });

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET)
            res.send({ result, token });
        });


        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await partsCollection.findOne(query);
            res.send(result);
        });


        // Get Part ID
        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
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

        app.get('/purchase', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            const authorization = req.headers.authorization;
            console.log('auth header', authorization);
            if (email === decodedEmail) {
                const query = { email: email };
                const purchase = await purchaseCollection.find(query).toArray();
                res.send(purchase);
            } else {
                return res.status(403).send({ message: 'forbidden access' });
            }
        });

        





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