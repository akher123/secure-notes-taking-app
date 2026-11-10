const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function auth(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        if (!payload.sub || !payload.role) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = { id: payload.sub, role: payload.role };
        return next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = auth;
