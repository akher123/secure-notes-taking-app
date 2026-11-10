
require('dotenv').config();
const mongoose = require('mongoose');

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        const db = mongoose.connection.db;

        // Insert Users
        const users = await db.collection('users').insertMany([
            {
                name: 'Rahim Ahmed',
                email: 'rahim@example.com',
                password: 'test123',
                role: 'user',
                interests: ['chess', 'reading', 'programming'],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'admin',
                interests: ['security', 'technology'],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        const userId = users.insertedIds[0];

        // Insert Notes
        await db.collection('notes').insertMany([
            {
                userId,
                title: 'Learning MongoDB',
                content: 'Learning MongoDB, Indexing and Aggregation.',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId,
                title: 'Backend Development',
                content: 'Learning Node.js and Express.js.',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        // Insert Posts
        await db.collection('posts').insertMany([
            {
                userId,
                title: 'My First Post',
                content: 'Learning MongoDB Aggregation Pipeline.',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        console.log('All data inserted successfully!');
        console.log('User ID:', userId);
        console.log("Connected Database:", mongoose.connection.name);
    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedData();
