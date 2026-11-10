const aggregationService = require('../services/aggregationService');

async function usersByInterest(req, res) {
    const data = await aggregationService.groupUsersByInterest();
    return res.json(data);
}

async function userPosts(req, res) {
    const user = await aggregationService.getUserPosts(req.params.id);
    return res.json(user);
}

module.exports = { usersByInterest, userPosts };
