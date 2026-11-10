const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const ApiError = require('../utils/ApiError');

function auth(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return next(new ApiError(401, 'Authentication required', 'UNAUTHORIZED'));
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        if (!payload.sub || !payload.role) {
            return next(new ApiError(401, 'Invalid token', 'INVALID_TOKEN'));
        }
        req.user = { id: payload.sub, role: payload.role };
        return next();
    } catch {
        return next(new ApiError(401, 'Invalid token', 'INVALID_TOKEN'));
    }
}

module.exports = auth;
