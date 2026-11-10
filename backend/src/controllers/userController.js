const userService = require('../services/userService');

const UPDATE_FIELDS = ['name', 'email', 'password', 'role', 'interests'];

async function listUsers(req, res) {
    const result = await userService.listUsers(req.query);
    return res.json(result);
}

async function createUser(req, res) {
    const user = await userService.createUser({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role || 'user',
        interests: req.body.interests,
    });
    return res.status(201).json(user);
}

async function getUser(req, res) {
    const user = await userService.getUserById(req.user, req.params.id);
    return res.json(user);
}

async function updateUser(req, res) {
    const updates = {};
    for (const field of UPDATE_FIELDS) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }
    const user = await userService.updateUser(req.params.id, updates);
    return res.json(user);
}

async function deleteUser(req, res) {
    await userService.deleteUser(req.params.id);
    return res.status(204).send();
}

module.exports = { listUsers, createUser, getUser, updateUser, deleteUser };
