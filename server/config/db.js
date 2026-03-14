const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        console.log('🔄 Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // Increased to 10s for slow cold starts
            maxPoolSize: 10,
            socketTimeoutMS: 45000,
            family: 4 // Force IPv4 to avoid some Vercel/Atlas networking issues
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Log more details if possible
        if (error.message.includes('timeout')) {
            console.error('💡 TIP: Check if your MongoDB Atlas IP Whitelist allows access from anywhere (0.0.0.0/0).');
        }
    }
};

module.exports = connectDB;
