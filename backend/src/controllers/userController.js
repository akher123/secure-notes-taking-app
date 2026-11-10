const userService = require('../services/userService');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(['user', 'admin']);

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

function readInterests(value) {
    if (value === undefined) {
        return undefined;
    }
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        return { error: 'Interests must be an array of strings' };
    }
    return { interests: value.map((item) => item.trim()).filter(Boolean) };
}

async function listUsers(req, res) {
    try {
        const result = await userService.listUsers(req.query);
        return res.json(result);
    } catch (error) {
        return sendError(res, error);
    }
}

async function createUser(req, res) {
    try {
        const name = readString(req.body?.name);
        const email = readString(req.body?.email).toLowerCase();
        const password = typeof req.body?.password === 'string' ? req.body.password : '';
        const role = req.body?.role === undefined ? 'user' : req.body.role;
        const interestsResult = readInterests(req.body?.interests);

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        if (!EMAIL_PATTERN.test(email)) {
            return res.status(400).json({ message: 'Email is invalid' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        if (!ROLES.has(role)) {
            return res.status(400).json({ message: 'Role must be user or admin' });
        }
        if (interestsResult?.error) {
            return res.status(400).json({ message: interestsResult.error });
        }

        const user = await userService.createUser({
            name,
            email,
            password,
            role,
            interests: interestsResult?.interests,
        });
        return res.status(201).json(user);
    } catch (error) {
        return sendError(res, error);
    }
}

async function getUser(req, res) {
    try {
        const user = await userService.getUserById(req.user, req.params.id);
        return res.json(user);
    } catch (error) {
        return sendError(res, error);
    }
}

async function updateUser(req, res) {
    try {
        const updates = {};
        if (req.body?.name !== undefined) {
            const name = readString(req.body.name);
            if (!name) {
                return res.status(400).json({ message: 'Name cannot be empty' });
            }
            updates.name = name;
        }
        if (req.body?.email !== undefined) {
            const email = readString(req.body.email).toLowerCase();
            if (!EMAIL_PATTERN.test(email)) {
                return res.status(400).json({ message: 'Email is invalid' });
            }
            updates.email = email;
        }
        if (req.body?.password !== undefined) {
            if (typeof req.body.password !== 'string' || req.body.password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters' });
            }
            updates.password = req.body.password;
        }
        if (req.body?.role !== undefined) {
            if (!ROLES.has(req.body.role)) {
                return res.status(400).json({ message: 'Role must be user or admin' });
            }
            updates.role = req.body.role;
        }
        const interestsResult = readInterests(req.body?.interests);
        if (interestsResult?.error) {
            return res.status(400).json({ message: interestsResult.error });
        }
        if (interestsResult?.interests) {
            updates.interests = interestsResult.interests;
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const user = await userService.updateUser(req.params.id, updates);
        return res.json(user);
    } catch (error) {
        return sendError(res, error);
    }
}

async function deleteUser(req, res) {
    try {
        await userService.deleteUser(req.params.id);
        return res.status(204).send();
    } catch (error) {
        return sendError(res, error);
    }
}

module.exports = { listUsers, createUser, getUser, updateUser, deleteUser };
