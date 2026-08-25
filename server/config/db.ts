import mongoose from 'mongoose';

let mongoMemoryServer: any = null;

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);
  const mongoUri = process.env.MONGO_URI;

  // 1. If explicit external MONGO_URI is set (e.g. MongoDB Atlas), try connecting to it
  if (mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log('[Database] MongoDB connected successfully to external URI.');
      return;
    } catch (err) {
      console.warn('[Database] External MONGO_URI connection attempt failed, falling back to embedded MongoDB server:', err);
    }
  }

  // 2. Try connecting to local MongoDB daemon (if running on machine/port 27017)
  try {
    const localUri = mongoUri || 'mongodb://127.0.0.1:27017/animeflix';
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 1200,
    });
    console.log('[Database] Connected to local MongoDB daemon successfully.');
    return;
  } catch {
    // Local standalone daemon is not running, proceed to embedded MongoMemoryServer
  }

  // 3. Boot Embedded MongoDB Server instance
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!mongoMemoryServer) {
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'animeflix',
        },
      });
    }

    const embeddedUri = mongoMemoryServer.getUri();
    await mongoose.connect(embeddedUri, {
      dbName: 'animeflix',
    });
    console.log(`[Database] MongoDB Server active and connected at ${embeddedUri} (db: animeflix)`);
  } catch (err) {
    console.error('[Database] Critical: Could not start or connect to MongoDB server:', err);
  }
}

