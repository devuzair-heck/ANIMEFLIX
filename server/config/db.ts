import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';
import net from 'net';

// Cached connection for serverless / container environments
let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

function sanitizeUri(uri?: string): string {
  if (!uri) return '';
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

function sanitizeErrorMessage(msg?: string): string {
  if (!msg) return '';
  return msg.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

function checkPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(600);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function findMongodBinary(): string | null {
  const cacheDir = path.join(process.cwd(), 'node_modules/.cache/mongodb-memory-server');
  if (fs.existsSync(cacheDir)) {
    const files = fs.readdirSync(cacheDir);
    const mongodFile = files.find((f) => f.startsWith('mongod-'));
    if (mongodFile) {
      return path.join(cacheDir, mongodFile);
    }
  }

  // System mongod fallback
  try {
    const which = execSync('which mongod', { encoding: 'utf8' }).trim();
    if (which && fs.existsSync(which)) return which;
  } catch {}

  return null;
}

export async function connectDB(): Promise<typeof mongoose> {
  // 1. If existing healthy connection is ready, reuse immediately
  if ((mongoose.connection.readyState as number) === 1 && cachedConnection) {
    return cachedConnection;
  }

  // 2. If connection is in progress, reuse the existing in-flight promise to prevent concurrent duplicate connections
  if (connectionPromise) {
    return connectionPromise;
  }

  const isVercel = Boolean(
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true' ||
    process.env.VERCEL_ENV ||
    process.env.NOW_REGION
  );
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGO_URI?.trim();

  // 3. Initiate new connection attempt
  connectionPromise = (async () => {
    mongoose.set('strictQuery', true);

    // --- Production / Vercel Serverless Flow ---
    if (isVercel || isProduction) {
      if (!mongoUri) {
        throw new Error('MongoDB Atlas connection failed: MONGO_URI environment variable is not defined.');
      }

      try {
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log('[Database] Connected to MongoDB Atlas:', sanitizeUri(mongoUri));
        console.log(`[Database] Database: ${conn.connection.db?.databaseName || 'animeflix'}`);
        return conn;
      } catch (err: any) {
        console.error('[Database] MongoDB Atlas connection failed:', sanitizeErrorMessage(err?.message));
        throw new Error('MongoDB Atlas connection failed');
      }
    }

    // --- Local Development Flow ---
    // If an external cloud MongoDB URI is provided during local dev, attempt to use it first
    if (mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
      try {
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log('[Database] Connected to external cloud MongoDB URI:', sanitizeUri(mongoUri));
        console.log(`[Database] Database: ${conn.connection.db?.databaseName || 'animeflix'}`);
        return conn;
      } catch (err: any) {
        console.warn(
          '[Database] External cloud MongoDB connection attempt failed during local dev, falling back to local persistent daemon:',
          sanitizeErrorMessage(err?.message)
        );
        await mongoose.disconnect().catch(() => {});
      }
    }

    // Local persistent storage path for local development
    const dbDir = path.join(process.cwd(), '.mongo-data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const uriFile = path.join(dbDir, 'mongo-uri.txt');

    // Check if local persistent mongod is already running on port 27017
    const is27017Open = await checkPortOpen(27017);
    const localUri = 'mongodb://127.0.0.1:27017/animeflix';

    if (is27017Open) {
      try {
        const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
        console.log('[Database] MongoDB connected to persistent daemon at ' + localUri);
        console.log(`[Database] Database name: ${conn.connection.db?.databaseName || 'animeflix'}`);
        fs.writeFileSync(uriFile, localUri, 'utf8');
        process.env.MONGO_URI = localUri;
        return conn;
      } catch (err) {
        console.warn('[Database] Existing port 27017 connection attempt failed:', err);
      }
    }

    // Launch native mongod daemon on port 27017 with persistent .mongo-data storage
    const mongodBin = findMongodBinary();
    if (mongodBin && fs.existsSync(mongodBin)) {
      const lockFile = path.join(dbDir, 'mongod.lock');
      if (!is27017Open && fs.existsSync(lockFile)) {
        try {
          fs.unlinkSync(lockFile);
          console.log('[Database] Cleared stale mongod.lock before daemon spawn');
        } catch {}
      }

      if (!is27017Open) {
        try {
          console.log(`[Database] Spawning persistent mongod daemon (storage: ${dbDir}, port: 27017)...`);
          const child = spawn(
            mongodBin,
            ['--dbpath', dbDir, '--port', '27017', '--bind_ip', '127.0.0.1', '--nounixsocket'],
            { detached: true, stdio: 'ignore' }
          );
          child.unref();

          // Wait up to 6 seconds for port 27017 to accept connections
          let ready = false;
          for (let i = 0; i < 30; i++) {
            await new Promise((r) => setTimeout(r, 200));
            if (await checkPortOpen(27017)) {
              ready = true;
              break;
            }
          }
          if (ready) {
            console.log('[Database] Persistent mongod daemon ready on port 27017');
          }
        } catch (spawnErr) {
          console.warn('[Database] Native mongod spawn notice:', spawnErr);
        }
      }

      try {
        const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 4000 });
        console.log('[Database] MongoDB connected successfully to persistent daemon');
        console.log(`[Database] Database name: ${conn.connection.db?.databaseName || 'animeflix'}`);
        fs.writeFileSync(uriFile, localUri, 'utf8');
        process.env.MONGO_URI = localUri;
        return conn;
      } catch (connErr) {
        console.error('[Database] Persistent mongod connection error:', connErr);
      }
    }

    // Memory server fallback for local development
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      let server: any;
      try {
        server = await MongoMemoryServer.create({
          instance: {
            dbName: 'animeflix',
            dbPath: dbDir,
          },
        });
      } catch (pathErr) {
        console.warn('[Database] Local persistent memory server path failed, falling back to clean in-memory server:', pathErr);
        server = await MongoMemoryServer.create({
          instance: {
            dbName: 'animeflix',
          },
        });
      }
      const fallbackUri = server.getUri() + 'animeflix';
      fs.writeFileSync(uriFile, fallbackUri, 'utf8');
      process.env.MONGO_URI = fallbackUri;
      const conn = await mongoose.connect(fallbackUri, { dbName: 'animeflix' });
      console.log('[Database] Connected to MongoMemoryServer at ' + fallbackUri);
      return conn;
    } catch (finalErr) {
      console.error('[Database] All local MongoDB connection attempts failed:', finalErr);
      throw new Error('Database connection failed: Could not connect to any MongoDB instance.');
    }
  })();

  try {
    const conn = await connectionPromise;
    cachedConnection = conn;
    return conn;
  } catch (err) {
    cachedConnection = null;
    throw err;
  } finally {
    connectionPromise = null;
  }
}




