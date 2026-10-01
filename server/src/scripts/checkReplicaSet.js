import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/evora';

async function checkReplicaSet() {
  console.log('====================================================');
  console.log('🔍 Checking MongoDB Connection & Replica Set Status');
  console.log('Target URI:', uri);
  console.log('====================================================\n');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB successfully.\n');

    const admin = conn.connection.db.admin();

    // Check hello / isMaster
    const hello = await admin.command({ hello: 1 });
    console.log('📌 Node Role:', hello.isWritablePrimary ? 'Writable Primary / Master' : 'Secondary / Other');
    console.log('📌 Max Wire Version:', hello.maxWireVersion);
    console.log('📌 Read Only:', Boolean(hello.readOnly));

    if (hello.setName) {
      console.log(`\n🎉 Replica Set is ACTIVE! Replica Set Name: "${hello.setName}"`);
      try {
        const rsStatus = await admin.command({ replSetGetStatus: 1 });
        console.log('📊 rs.status() summary:');
        console.log(`- Set Name: ${rsStatus.set}`);
        console.log(`- My State: ${rsStatus.myState} (${rsStatus.members?.find(m => m.self)?.stateStr || 'PRIMARY'})`);
        console.log(`- Members Count: ${rsStatus.members ? rsStatus.members.length : 1}`);
        console.log('✅ Transactions are FULLY SUPPORTED on this MongoDB instance.');
      } catch (e) {
        console.log('Could not get full replSetGetStatus:', e.message);
      }
    } else {
      console.log('\n⚠️  MongoDB is currently running in STANDALONE mode (No replica set configured).');
      console.log('ℹ️  MongoDB multi-document ACID transactions require a replica set.');
      console.log('\n----------------------------------------------------');
      console.log('📋 HOW TO CONFIGURE A SINGLE-NODE REPLICA SET ON WINDOWS:');
      console.log('----------------------------------------------------');
      console.log('Step 1: Open Notepad as Administrator.');
      console.log('Step 2: Open configuration file:');
      console.log('        "C:\\Program Files\\MongoDB\\Server\\9.0\\bin\\mongod.cfg"');
      console.log('Step 3: Find or add the replication section:');
      console.log('        replication:');
      console.log('          replSetName: "rs0"');
      console.log('Step 4: Save the file and restart MongoDB Service in Administrator PowerShell:');
      console.log('        Restart-Service MongoDB');
      console.log('        (or in Admin CMD: net stop MongoDB && net start MongoDB)');
      console.log('Step 5: Run the automatic EVora replica set initiator:');
      console.log('        npm run init-rs');
      console.log('----------------------------------------------------\n');
    }
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkReplicaSet();
