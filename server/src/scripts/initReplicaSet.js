import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/evora';

async function initReplicaSet() {
  console.log('⚡ Initializing Single-Node Replica Set "rs0"...');
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, directConnection: true });
    const admin = conn.connection.db.admin();

    const config = {
      _id: 'rs0',
      members: [
        { _id: 0, host: '127.0.0.1:27017' }
      ]
    };

    const res = await admin.command({ replSetInitiate: config });
    console.log('✅ rs.initiate() result:', res);
    console.log('🎉 Replica set initialized successfully! Please wait ~5 seconds for election to complete.');
  } catch (error) {
    if (error.codeName === 'AlreadyInitialized') {
      console.log('ℹ️ Replica set is already initialized.');
    } else {
      console.error('❌ Failed to initialize replica set:', error.message);
      console.log('Make sure "replication.replSetName: rs0" is added to mongod.cfg and the service was restarted first.');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

initReplicaSet();
