const authService = require('../services/authService');

async function register(req, res) {
    const result = await authService.register({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });
    return res.status(201).json(result);
}

async function login(req, res) {
    const result = await authService.login({
        email: req.body.email,
        password: req.body.password,
    });
    return res.json(result);
}

async function me(req, res) {
    const user = await authService.getMe(req.user.id);
    return res.json(user);
}

module.exports = { register, login, me };
