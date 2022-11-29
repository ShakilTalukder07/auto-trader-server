const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const { query } = require('express');
const app = express();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


// middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.1ndgjy2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const categoryCollection = client.db('resala').collection('category')
        const carsCollection = client.db('resala').collection('cars')
        const bookingsCollection = client.db('resala').collection('bookings')
        const usersCollection = client.db('resala').collection('users')
        const productsCollection = client.db('resala').collection('products')
        const paymentsCollection = client.db('resala').collection('payments')
        const advertiseCollection = client.db('resala').collection('advertise')

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
            res.send(category)
        });

        app.get('/cars/:categoryName', async (req, res) => {
            const name = req.params.categoryName
            const query = { category_name: name }
            const category = await carsCollection.find(query).toArray()
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
            const result = await bookingsCollection.insertOne(booking)
            res.send(result)
        });

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bookings = await bookingsCollection.findOne(query);
            res.send(bookings);
        });

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email
            const query = { userEmail: email }
            const bookings = await bookingsCollection.find(query).toArray()
            res.send(bookings)
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        });

        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productsCollection.insertOne(products);
            res.send(result);
        })

        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray()
            res.send(products)
        });

        // delete a product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(filter);
            res.send(result);
        })

        // get seller from usersCollection
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const user = await usersCollection.findOne(query)
            res.send({ isSeller: user?.role === 'seller' })
        });

        // for social user Login
        app.post('/users', async (req, res) => {
            const socialUser = req.body;
            const result = await usersCollection.insertOne(socialUser)
            res.send(result)
        })


        //advertise a product
        app.post('/advertiseProduct', async (req, res) => {
            const advertiseProduct = req.body;
            const result = await advertiseCollection.insertOne(advertiseProduct)
            res.send(result)
        })

        //show advertise products
        app.get('/advertiseProduct', async (req, res) => {
            const query = {}
            const result = await advertiseCollection.find(query).toArray()
            res.send(result)
        });

        // get admin from userCollection for admin route
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            if (query) {
                res.send(result)
            }
        })

        // get buyer from buyerCollection for buyer route
        app.get('/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            if (query) {
                res.send(result)
            }
        })


        // get all buyers
        app.get('/allBuyers', async (req, res) => {
            const query = { role: "buyer" }
            const user = await usersCollection.find(query).toArray()
            res.send(user)
        });

        //delete a buyer
        app.delete('/allBuyers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        });

        // get all sellers
        app.get('/allSellers', async (req, res) => {
            const query = { role: "seller" }
            const user = await usersCollection.find(query).toArray()
            res.send(user)
        });

        app.delete('/allSellers/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const query = {}
            const users = await usersCollection.find(query).toArray()
            res.send(users);
        });

        app.post('/users', async (req, res) => {
            const users = req.body
            const result = await usersCollection.insertOne(users)
            res.send(result)
        });

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const itemPrice = booking.itemPrice;
            const amount = itemPrice * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        })

        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment)
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc)
            res.send(result);
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