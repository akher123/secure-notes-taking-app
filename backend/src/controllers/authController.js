const authService = require('../services/authService');

function readString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function sendError(res, error) {
    if (error.code === 11000) {
        return res.status(409).json({ message: 'Email already registered' });
    }
    const status = error.status || 500;
    if (status >= 500) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(status).json({ message: error.message });
}

async function register(req, res) {
    try {
        const name = readString(req.body?.name);
        const email = readString(req.body?.email).toLowerCase();
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Email is invalid' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const result = await authService.register({ name, email, password });
        return res.status(201).json(result);
    } catch (error) {
        return sendError(res, error);
    }
}

async function login(req, res) {
    try {
        const email = readString(req.body?.email).toLowerCase();
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const result = await authService.login({ email, password });
        return res.json(result);
    } catch (error) {
        return sendError(res, error);
    }
}

async function me(req, res) {
    try {
        const user = await authService.getMe(req.user.id);
        return res.json(user);
    } catch (error) {
        return sendError(res, error);
    }
}

module.exports = { register, login, me };
