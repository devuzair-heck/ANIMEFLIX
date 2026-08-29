import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

let mongoMemoryServer: any = null;
let isConnecting = false;

export async function connectDB(): Promise<void> {
  // If already connected, reuse existing connection immediately
  if ((mongoose.connection.readyState as number) === 1) {
    return;
  }

  // If already in the process of connecting, await readyState
  if (isConnecting || (mongoose.connection.readyState as number) === 2) {
    let attempts = 0;
    while ((mongoose.connection.readyState as number) !== 1 && attempts < 20) {
      await new Promise((r) => setTimeout(r, 100));
      attempts++;
    }
    if ((mongoose.connection.readyState as number) === 1) return;
  }

  isConnecting = true;
  mongoose.set('strictQuery', true);
  const mongoUri = process.env.MONGO_URI;

  // 1. If explicit external MONGO_URI is set (e.g. MongoDB Atlas), connect directly
  if (mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log('[Database] MongoDB connected successfully to external URI.');
      isConnecting = false;
      return;
    } catch (err) {
      console.warn('[Database] External MONGO_URI connection attempt failed, falling back to embedded MongoDB server:', err);
    }
  }

  // 2. Try fast connection to local MongoDB daemon (if running)
  if (mongoUri && (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost'))) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 800,
      });
      console.log('[Database] Connected to local MongoDB daemon successfully.');
      isConnecting = false;
      return;
    } catch {
      // Local daemon unavailable, fallback to MongoMemoryServer
    }
  }

  // 3. Boot Embedded MongoDB Server instance
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbDir = path.join(process.cwd(), '.mongo-data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (!mongoMemoryServer) {
      try {
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'animeflix',
            dbPath: dbDir,
            storageEngine: 'wiredTiger',
          },
        });
      } catch (memErr) {
        console.warn('[Database] Persistent MongoMemoryServer note, trying fallback in-memory mode:', memErr);
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'animeflix',
          },
        });
      }
    }

    const embeddedUri = mongoMemoryServer.getUri();
    await mongoose.connect(embeddedUri, {
      dbName: 'animeflix',
    });
    console.log(`[Database] MongoDB Server active and connected at ${embeddedUri} (db: animeflix, persistence: .mongo-data)`);
  } catch (err) {
    console.error('[Database] Critical: Could not start or connect to MongoDB server:', err);
  } finally {
    isConnecting = false;
  }
}


