const aggregationService = require('../services/aggregationService');

function sendError(res, error) {
    const status = error.status || 500;
    if (status >= 500) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(status).json({ message: error.message });
}

async function usersByInterest(req, res) {
    try {
        const data = await aggregationService.groupUsersByInterest();
        return res.json(data);
    } catch (error) {
        return sendError(res, error);
    }
}

async function userPosts(req, res) {
    try {
        const user = await aggregationService.getUserPosts(req.params.id);
        return res.json(user);
    } catch (error) {
        return sendError(res, error);
    }
}

module.exports = { usersByInterest, userPosts };
