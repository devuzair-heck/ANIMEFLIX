import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { spawn, execSync } from 'child_process';
import net from 'net';

// Cached connection for serverless / container environments
let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

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
  // If already fully connected, reuse connection immediately
  if ((mongoose.connection.readyState as number) === 1 && cachedConnection) {
    return cachedConnection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    mongoose.set('strictQuery', true);

    const dbDir = path.join(process.cwd(), '.mongo-data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const uriFile = path.join(dbDir, 'mongo-uri.txt');

    const mongoUri = process.env.MONGO_URI;

    // 1. If explicit external cloud MongoDB URI is configured (e.g. Vercel Atlas connection)
    if (mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
      try {
        const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('[Database] Connected to external cloud MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***@'));
        console.log(`[Database] Database: ${conn.connection.db?.databaseName || 'animeflix'}`);
        cachedConnection = conn;
        return conn;
      } catch (err) {
        console.warn('[Database] External cloud MongoDB connection failed:', err);
      }
    }

    // 2. Check if local persistent mongod is already running on port 27017
    const is27017Open = await checkPortOpen(27017);
    const localUri = 'mongodb://127.0.0.1:27017/animeflix';

    if (is27017Open) {
      try {
        const conn = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
        console.log('[Database] MongoDB connected to persistent daemon at ' + localUri);
        console.log(`[Database] Database name: ${conn.connection.db?.databaseName || 'animeflix'}`);
        fs.writeFileSync(uriFile, localUri, 'utf8');
        process.env.MONGO_URI = localUri;
        cachedConnection = conn;
        return conn;
      } catch (err) {
        console.warn('[Database] Existing port 27017 connection attempt failed:', err);
      }
    }

    // 3. Launch native mongod daemon on port 27017 with persistent .mongo-data storage
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
        cachedConnection = conn;
        return conn;
      } catch (connErr) {
        console.error('[Database] Persistent mongod connection error:', connErr);
      }
    }

    // 4. Memory server fallback with persistent .mongo-data storage
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const server = await MongoMemoryServer.create({
        instance: {
          dbName: 'animeflix',
          dbPath: dbDir,
        },
      });
      const fallbackUri = server.getUri() + 'animeflix';
      fs.writeFileSync(uriFile, fallbackUri, 'utf8');
      process.env.MONGO_URI = fallbackUri;
      const conn = await mongoose.connect(fallbackUri, { dbName: 'animeflix' });
      console.log('[Database] Connected to MongoMemoryServer at ' + fallbackUri);
      cachedConnection = conn;
      return conn;
    } catch (finalErr) {
      console.error('[Database] All MongoDB connection attempts failed:', finalErr);
      throw new Error('Database connection failed: Could not connect to any MongoDB instance.');
    }
  })();

  try {
    const conn = await connectionPromise;
    return conn;
  } finally {
    connectionPromise = null;
  }
}




