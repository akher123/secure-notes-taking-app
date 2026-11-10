const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof ApiError) {
        const body = { message: err.message };
        if (err.code) {
            body.code = err.code;
        }
        return res.status(err.statusCode).json(body);
    }

    if (err && (err.code === 11000 || err.code === 11001)) {
        return res.status(409).json({
            message: 'Email already registered',
            code: 'EMAIL_TAKEN',
        });
    }

    if (err && err.name === 'ValidationError') {
        return res.status(400).json({
            message: err.message,
            code: 'VALIDATION_ERROR',
        });
    }

    if (err && (err.name === 'CastError' || err.name === 'BSONError')) {
        return res.status(404).json({
            message: 'Resource not found',
            code: 'NOT_FOUND',
        });
    }

    if (err instanceof SyntaxError || err?.type === 'entity.parse.failed') {
        return res.status(400).json({
            message: 'Invalid JSON body',
            code: 'INVALID_JSON',
        });
    }

    console.error(err);
    return res.status(500).json({
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
    });
}

module.exports = errorHandler;
