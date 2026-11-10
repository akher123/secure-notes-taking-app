const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');
const openApiSpec = require('./docs/openapi');

const app = express();

// Swagger UI needs inline scripts and styles. Other Helmet protections stay on.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Secure Note Taking App API is Running!' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/docs.json', (req, res) => {
    res.json(openApiSpec);
});

app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res, next) => {
    next(new ApiError(404, 'Route not found', 'NOT_FOUND'));
});

app.use(errorHandler);

module.exports = app;
