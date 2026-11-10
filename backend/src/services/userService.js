const mongoose = require('mongoose');
const User = require('../models/User');
const { parsePagination, buildMeta } = require('../utils/pagination');
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
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    const isSelf = String(requester.id) === String(id);
    if (requester.role !== 'admin' && !isSelf) {
        throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    }

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }
    return toPublicUser(user);
}

async function updateUser(id, updates) {
    if (!mongoose.isValidObjectId(id)) {
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    const user = await User.findById(id).select('+password');
    if (!user) {
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
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
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }
}

module.exports = { listUsers, createUser, getUserById, updateUser, deleteUser };
