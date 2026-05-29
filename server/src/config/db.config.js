import mongoose from 'mongoose';

let useLocalDB = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI || mongoURI.includes('<username>') || mongoURI.includes('your_') || mongoURI.includes('placeholder')) {
    console.warn('⚠️ MONGODB_URI is not configured or contains placeholders. Falling back to local JSON file database.');
    useLocalDB = true;
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ Failed to connect to MongoDB. Falling back to local JSON file database.');
    useLocalDB = true;
  }
};

export { useLocalDB };
export default connectDB;
