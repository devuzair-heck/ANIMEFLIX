import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

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
    while ((mongoose.connection.readyState as number) !== 1 && attempts < 25) {
      await new Promise((r) => setTimeout(r, 100));
      attempts++;
    }
    if ((mongoose.connection.readyState as number) === 1) return;
  }

  isConnecting = true;
  mongoose.set('strictQuery', true);

  const dbDir = path.join(process.cwd(), '.mongo-data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const uriFile = path.join(dbDir, 'mongo-uri.txt');

  const mongoUri = process.env.MONGO_URI;

  // 1. If explicit external MONGO_URI is set (e.g. MongoDB Atlas), connect directly
  if (mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log('[Database] MongoDB connected successfully to external URI.');
      isConnecting = false;
      return;
    } catch (err) {
      console.warn('[Database] External MONGO_URI connection attempt failed, falling back to persistent local database:', err);
    }
  }

  // 2. Try saved URI file from active persistent mongod
  if (fs.existsSync(uriFile)) {
    try {
      const savedUri = fs.readFileSync(uriFile, 'utf8').trim();
      if (savedUri) {
        await mongoose.connect(savedUri, { serverSelectionTimeoutMS: 1500 });
        console.log(`[Database] Connected to existing active MongoDB at ${savedUri}`);
        process.env.MONGO_URI = savedUri;
        isConnecting = false;
        return;
      }
    } catch {
      // Saved URI not responding, continue to detection or fresh spawn
    }
  }

  // 3. Detect running mongod daemon process port on system
  try {
    const psOut = execSync('ps aux | grep mongod', { encoding: 'utf8' });
    const match = psOut.match(/--port\s+(\d+)/);
    if (match && match[1]) {
      const detectedPort = match[1];
      const detectedUri = `mongodb://127.0.0.1:${detectedPort}/animeflix`;
      await mongoose.connect(detectedUri, { serverSelectionTimeoutMS: 1500 });
      fs.writeFileSync(uriFile, detectedUri, 'utf8');
      process.env.MONGO_URI = detectedUri;
      console.log(`[Database] Re-attached to running mongod process on port ${detectedPort}`);
      isConnecting = false;
      return;
    }
  } catch {
    // Process detection fallback
  }

  // 4. Clean up any stale lock if no mongod process is running
  const lockFile = path.join(dbDir, 'mongod.lock');
  try {
    const psCheck = execSync('ps aux | grep mongod | grep -v grep', { encoding: 'utf8' });
    if (!psCheck.trim() && fs.existsSync(lockFile)) {
      fs.unlinkSync(lockFile);
      console.log('[Database] Removed stale mongod.lock file.');
    }
  } catch {
    // If grep returns non-zero, no mongod process exists; safely remove stale lock
    if (fs.existsSync(lockFile)) {
      try {
        fs.unlinkSync(lockFile);
      } catch {
        // Ignore
      }
    }
  }

  // 5. Boot Embedded Persistent MongoDB Server instance
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');

    if (!mongoMemoryServer) {
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'animeflix',
          dbPath: dbDir,
          storageEngine: 'wiredTiger',
        },
      });
    }

    const embeddedUri = mongoMemoryServer.getUri() + 'animeflix';
    fs.writeFileSync(uriFile, embeddedUri, 'utf8');
    process.env.MONGO_URI = embeddedUri;

    await mongoose.connect(embeddedUri, {
      dbName: 'animeflix',
    });
    console.log(`[Database] MongoDB Server active and connected at ${embeddedUri} (db: animeflix, persistence: .mongo-data)`);
  } catch (err: any) {
    console.error('[Database] Critical: Could not start or connect to persistent MongoDB server:', err);
    // Ultimate fallback if storage directory locked
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'animeflix',
        },
      });
      const fallbackUri = mongoMemoryServer.getUri() + 'animeflix';
      await mongoose.connect(fallbackUri, { dbName: 'animeflix' });
      console.log(`[Database] Fallback memory MongoDB active at ${fallbackUri}`);
    } catch (fallbackErr) {
      console.error('[Database] Fatal fallback connection error:', fallbackErr);
    }
  } finally {
    isConnecting = false;
  }
}



