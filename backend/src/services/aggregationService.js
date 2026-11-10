const mongoose = require('mongoose');
const User = require('../models/User');
const groupByInterestsPipeline = require('../aggregations/groupByInterests');
const userPostsLookupPipeline = require('../aggregations/userPostsLookup');

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

async function groupUsersByInterest() {
    return User.aggregate(groupByInterestsPipeline);
}

async function getUserPosts(userId) {
    if (!mongoose.isValidObjectId(userId)) {
        throw httpError(404, 'User not found');
    }

    const results = await User.aggregate(userPostsLookupPipeline(userId));
    if (results.length === 0) {
        throw httpError(404, 'User not found');
    }

    return results[0];
}

module.exports = { groupUsersByInterest, getUserPosts };
