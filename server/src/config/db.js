import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isReplicaSet = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/evora';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Detect if replica set is active
    try {
      const admin = conn.connection.db.admin();
      const hello = await admin.command({ hello: 1 });
      isReplicaSet = Boolean(hello.setName);
      if (isReplicaSet) {
        console.log(`🔒 Replica Set Active: "${hello.setName}" (ACID Transactions enabled)`);
      } else {
        console.log(`ℹ️ Running in Standalone mode (Single-document atomicity active)`);
      }
    } catch {
      isReplicaSet = false;
    }

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
}

export function checkIsReplicaSet() {
  return isReplicaSet;
}
