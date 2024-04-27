const mongoose = require('mongoose');

const connectionUrl = process.env.MONGO_URL;

mongoose.connect(connectionUrl, {useNewUrlParser: true, dbName: 'express_mongo_auth'}).then(() => {
    console.log('Connected to mongo');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
})

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
})

mongoose.connection.on('connected',() => {
    console.log('MongoDB connection connected');
})

process.on('SIGINT', async (code) => {
    await mongoose.connection.close()
    process.exit(0);
})