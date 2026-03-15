// server/config/db.js
import mongoose from 'mongoose';

const buildUri = () => {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  const user = process.env.MONGODB_USER || '';
  const pass = process.env.MONGODB_PASS || '';
  const host = process.env.MONGODB_HOST || 'cluster0.ownjzna.mongodb.net';
  const db = process.env.MONGODB_DB || '';
  const opts = process.env.MONGODB_OPTIONS || '?retryWrites=true&w=majority';

  if (!user || !pass) return null;

  const userEnc = encodeURIComponent(user);
  const passEnc = encodeURIComponent(pass);

  return `mongodb+srv://${userEnc}:${passEnc}@${host}/${db}${opts}`;
};

const connectDB = async () => {
  const uri = buildUri();
  console.log('MONGODB_URI loaded:', !!process.env.MONGODB_URI ? 'YES (full URI)' : (uri ? 'YES (constructed from user/pass)' : 'NO (undefined!)'));

  if (!uri) {
    const err = new Error('No MongoDB connection info found in environment (MONGODB_URI or MONGODB_USER/MONGODB_PASS)');
    console.error(err.message);
    throw err;
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export default connectDB;
