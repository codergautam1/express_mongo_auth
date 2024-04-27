const express = require('express');
const app = express();
require('dotenv').config();
require('./helpers/initdb');
require('./helpers/initRedis')

const createError = require('http-errors');

const authRoute = require('./routes/auth.route');
const morgan = require("morgan");
const {verifyToken} = require("./helpers/jwtHelper");
app.use(express.json())
app.use(morgan('dev'));

app.use('/auth', authRoute);

app.get('/',verifyToken, (req, res) => {
    res.send(req.payload);
})

app.use(async (req, res, next) => {
    next(createError.NotFound("Page Not Found"));
})

app.use(async (err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: {
            message: err.message,
            status: err.status || 500,
        }
    })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Express server started http://localhost:${port}`);
})