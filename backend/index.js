// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();

const PORT = 3000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('MongoDB connected successfully!');
    })
    .catch((error) => {
        console.error('MongoDB connection failed:', error.message);
    });

// Home route
app.get('/', (req, res) => {
    res.send('Secure Note Taking App API is Running!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});