import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/animeflix';

  try {
    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1500, // Timeout fast if local MongoDB server is offline
    });
    console.log('[Database] MongoDB connected successfully.');
  } catch (err) {
    console.warn('[Database] MongoDB connection notice: Could not connect to MongoDB server.');
    console.warn(`[Database] Target URI: ${mongoUri}`);
    console.warn('[Database] Running in fallback memory mode for catalog preview.');
  }
}
