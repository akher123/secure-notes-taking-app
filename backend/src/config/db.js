const mongoose = require('mongoose');
const { env } = require('./env');

async function connectDB() {
    await mongoose.connect(env.MONGO_URL);
    console.log('MongoDB connected successfully!');
}

module.exports = { connectDB };
