const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;


// middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1ndgjy2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoryCollection = client.db('resala').collection('category')
        const carsCollection = client.db('resala').collection('cars')
        const bookingsCollection = client.db('resala').collection('bookings')
        const usersCollection = client.db('resala').collection('users')

        app.get('/category', async (req, res) => {
            const query = {}
            const cursor = categoryCollection.find(query)
            const category = await cursor.toArray()
            res.send(category)
        });

        app.get('/category/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const category = await categoryCollection.findOne(query)
            // console.log(category);
            res.send(category)
        });

        app.get('/cars/:categoryName', async (req, res) => {
            const name = req.params.categoryName
            const query = { category_name: name }
            const category = await carsCollection.find(query).toArray()
            // console.log(category);
            res.send(category)
        });

        app.get('/cars', async (req, res) => {
            const query = {}
            const cursor = await carsCollection.find(query)
            const cars = await cursor.toArray()
            res.send(cars)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body
            // console.log(booking);
            const result = await bookingsCollection.insertOne(booking)
            res.send(result)
        });

        app.get('/bookings', async (req, res) => {
            const email = req.query.email
            const query = { userEmail: email }
            const bookings = await bookingsCollection.find(query).toArray()
            res.send(bookings)
        });

        app.post('/users', async (req, res) => {
            const users = req.body
            const result = await usersCollection.insertOne(users)
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(error => console.error(error))



app.get('/', (req, res) => {
    res.send('Resala server is running')
})

app.listen(port, () => {
    console.log(`Resala server is running on ${port}`);
})