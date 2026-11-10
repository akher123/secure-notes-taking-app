const mongoose = require('mongoose');
const User = require('../models/User');
const groupByInterestsPipeline = require('../aggregations/groupByInterests');
const userPostsLookupPipeline = require('../aggregations/userPostsLookup');
const ApiError = require('../utils/ApiError');

async function groupUsersByInterest() {
    return User.aggregate(groupByInterestsPipeline);
}

async function getUserPosts(userId) {
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    const results = await User.aggregate(userPostsLookupPipeline(userId));
    if (results.length === 0) {
        throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    return results[0];
}

module.exports = { groupUsersByInterest, getUserPosts };
