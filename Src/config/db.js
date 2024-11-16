import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB)
        console.log(`MongoDB connected to: ${conn.connection.host}`);
    } catch (error) {
        console.log(error)
    }
}

connectDB()