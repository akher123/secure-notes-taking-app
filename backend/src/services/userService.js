const mongoose = require('mongoose');
const User = require('../models/User');
const { parsePagination, buildMeta } = require('../utils/pagination');

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

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

async function listUsers(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    const [total, users] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return {
        data: users.map(toPublicUser),
        meta: buildMeta(page, limit, total),
    };
}

async function createUser({ name, email, password, role, interests }) {
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        interests: interests || [],
    });
    return toPublicUser(user);
}

async function getUserById(requester, id) {
    if (!mongoose.isValidObjectId(id)) {
        throw httpError(404, 'User not found');
    }

    const isSelf = String(requester.id) === String(id);
    if (requester.role !== 'admin' && !isSelf) {
        throw httpError(403, 'Forbidden');
    }

    const user = await User.findById(id);
    if (!user) {
        throw httpError(404, 'User not found');
    }
    return toPublicUser(user);
}

async function updateUser(id, updates) {
    if (!mongoose.isValidObjectId(id)) {
        throw httpError(404, 'User not found');
    }

    const user = await User.findById(id).select('+password');
    if (!user) {
        throw httpError(404, 'User not found');
    }

    if (updates.name !== undefined) user.name = updates.name;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.interests !== undefined) user.interests = updates.interests;
    if (updates.password !== undefined) user.password = updates.password;

    await user.save();
    return toPublicUser(user);
}

async function deleteUser(id) {
    if (!mongoose.isValidObjectId(id)) {
        throw httpError(404, 'User not found');
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
        throw httpError(404, 'User not found');
    }
}

module.exports = { listUsers, createUser, getUserById, updateUser, deleteUser };
