function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const env = {
    MONGO_URL: requireEnv('MONGO_URL'),
    PORT: Number(process.env.PORT) || 3000,
    JWT_SECRET: requireEnv('JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

module.exports = { env, requireEnv };
