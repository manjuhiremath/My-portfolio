import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  console.log('[MongoDB] Checking existing connection...');
  
  if (cached.conn) {
    console.log('[MongoDB] Using existing connection');
    return cached.conn;
  }

  console.log('[MongoDB] No existing connection, creating new one...');
  console.log('[MongoDB] URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//****:****@'));

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('[MongoDB] Connecting to MongoDB...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('[MongoDB] Connection successful!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('[MongoDB] Cached connection established');
  } catch (e) {
    console.error('[MongoDB] Connection error:', e.message);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};
