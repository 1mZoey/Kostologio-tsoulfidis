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
  console.log('Full URI being used:', uri);
  //console.log('MONGODB_URI loaded:', !!process.env.MONGODB_URI ? 'YES (full URI)' : (uri ? 'YES (constructed from user/pass)' : 'NO (undefined!)'));

  if (!uri) {
    console.error('No MongoDB connection info found in environment (MONGODB_URI or MONGODB_USER/MONGODB_PASS)');
    console.log('Running in offline/disconnected mode.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log('MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Running in offline/disconnected mode.');
  }
};

export default connectDB;
