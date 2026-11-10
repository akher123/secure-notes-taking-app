require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/db');
const User = require('./src/models/User');
const Note = require('./src/models/Note');
const Post = require('./src/models/Post');

const DEMO_USERS = [
    {
        name: 'Rahim Ahmed',
        email: 'rahim@example.com',
        password: 'test123',
        role: 'user',
        interests: ['chess', 'reading', 'programming'],
    },
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        interests: ['security', 'technology'],
    },
];

const DEMO_NOTES = [
    {
        title: 'Learning MongoDB',
        content: 'Learning MongoDB, Indexing and Aggregation.',
    },
    {
        title: 'Backend Development',
        content: 'Learning Node.js and Express.js.',
    },
];

const DEMO_POSTS = [
    {
        title: 'My First Post',
        content: 'Learning MongoDB Aggregation Pipeline.',
    },
];

async function upsertUser(user) {
    const password = await bcrypt.hash(user.password, 10);
    return User.findOneAndUpdate(
        { email: user.email },
        {
            $set: {
                name: user.name,
                password,
                role: user.role,
                interests: user.interests,
            },
            $setOnInsert: { email: user.email },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
}

async function upsertByTitle(Model, userId, item) {
    await Model.findOneAndUpdate(
        { userId, title: item.title },
        {
            $set: { content: item.content },
            $setOnInsert: { userId, title: item.title },
        },
        { upsert: true, setDefaultsOnInsert: true }
    );
}

async function seedData() {
    await connectDB();
    await Promise.all([User.syncIndexes(), Note.syncIndexes(), Post.syncIndexes()]);

    const rahim = await upsertUser(DEMO_USERS[0]);
    const admin = await upsertUser(DEMO_USERS[1]);

    for (const note of DEMO_NOTES) {
        await upsertByTitle(Note, rahim._id, note);
    }
    for (const post of DEMO_POSTS) {
        await upsertByTitle(Post, rahim._id, post);
    }

    const stored = await User.findById(rahim._id).select('+password');
    const hashed = stored.password.startsWith('$2');

    console.log('Seed complete.');
    console.log('Database:', mongoose.connection.name);
    console.log('User:', rahim.email, rahim._id.toString());
    console.log('Admin:', admin.email, admin._id.toString());
    console.log('Password stored as bcrypt hash:', hashed);
}

seedData()
    .catch((error) => {
        console.error('Seed Error:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
