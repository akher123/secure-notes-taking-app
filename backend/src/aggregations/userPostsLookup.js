const mongoose = require('mongoose');

function userPostsLookupPipeline(userId) {
    return [
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: 'posts',
                localField: '_id',
                foreignField: 'userId',
                as: 'posts',
            },
        },
        { $project: { password: 0 } },
    ];
}

module.exports = userPostsLookupPipeline;
