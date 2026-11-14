import mongoose from 'mongoose';

// Serverless functions can be frozen and restarted between requests, so we
// keep one connection promise per instance and reuse it instead of
// reconnecting on every request.
let connection = null;

export function connectDB() {
  if (!connection) {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }
    connection = mongoose.connect(process.env.MONGODB_URI).catch((err) => {
      connection = null; // allow a retry on the next request
      throw err;
    });
  }
  return connection;
}
