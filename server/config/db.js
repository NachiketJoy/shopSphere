const mongoose = require('mongoose');

// connection to database
const connectDB = async () => {
    const mongoURL = process.env.MONGODB_URI;
    try {
        mongoose.set('strictQuery', true);
        const conn = await mongoose.connect(mongoURL)
        console.log(`Connected to MongoDB ${conn.connection.host}`);
    } catch (err) {
        console.error(`Connection failed: ${err}`);
    }
}

module.exports = connectDB;