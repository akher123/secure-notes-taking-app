const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Secure Note Taking App API is Running!' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

module.exports = app;
