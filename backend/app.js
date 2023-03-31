const express = require('express');
const helmet = require("helmet");
const mongoose = require('mongoose');
const mongodbSanitize = require('express-mongo-sanitize');
const validator = require("email-validator");
validator.validate("test@email.com");
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
require('dotenv').config()

const app = express();
app.use(mongodbSanitize());
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const path = require('path');
const bodyParser = require('body-parser');
const { config } = require('dotenv');
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(limiter)

mongoose.connect(`mongodb+srv://${process.env.CONNECT_USER}:${process.env.CONNECT_PWD}@cluster0.gungsxa.mongodb.net/test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('connexion reussi');
}).catch(() => {
    console.log('connexion echoué');
});


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;