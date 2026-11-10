const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');
const ApiError = require('../utils/ApiError');

function toPublicUser(user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

function signToken(user) {
    return jwt.sign(
        { sub: user._id.toString(), role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );
}

async function register({ name, email, password }) {
    const user = await User.create({
        name,
        email,
        password,
        role: 'user',
    });
    return { token: signToken(user), user: toPublicUser(user) };
}

async function login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    const passwordMatches = user
        ? await bcrypt.compare(password, user.password)
        : false;

    if (!user || !passwordMatches) {
        throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    return { token: signToken(user), user: toPublicUser(user) };
}

async function getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(401, 'Invalid token', 'INVALID_TOKEN');
    }
    return toPublicUser(user);
}

module.exports = { register, login, getMe };
