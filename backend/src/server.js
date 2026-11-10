const app = require('./app');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');

async function start() {
    await connectDB();
    app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
    });
}

start().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
});
