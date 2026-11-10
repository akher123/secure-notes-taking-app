const groupByInterestsPipeline = [
    {
        $project: {
            name: 1,
            email: 1,
            interests: 1,
        },
    },
    { $unwind: '$interests' },
    {
        $group: {
            _id: '$interests',
            count: { $sum: 1 },
            users: {
                $push: {
                    id: '$_id',
                    name: '$name',
                    email: '$email',
                },
            },
        },
    },
    { $sort: { _id: 1 } },
];

module.exports = groupByInterestsPipeline;
