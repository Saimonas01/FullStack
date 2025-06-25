import { MongoClient } from 'mongodb';

let db = null;
let client = null;

const connectDB = async () => {
  try {
    if (db) {
      console.log('✅ Using existing MongoDB connection');
      return db;
    }

    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<username>')) {
      console.error('❌ MongoDB URI not properly configured');
      console.log('📝 Please update your .env file with a valid MongoDB Atlas connection string');
      console.log('🔗 Get your connection string from: https://cloud.mongodb.com/');
      process.exit(1);
    }

    client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    db = client.db();

    console.log(`✅ MongoDB Connected: ${client.options.hosts[0]}`);
    console.log(`📁 Database: ${db.databaseName}`);

    await createIndexes();

    return db;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Tip: Local MongoDB is not supported in this environment');
      console.log('🌐 Please use MongoDB Atlas (cloud) instead');
      console.log('📋 Steps to fix:');
      console.log('   1. Go to https://cloud.mongodb.com/');
      console.log('   2. Create a free cluster');
      console.log('   3. Get your connection string');
      console.log('   4. Update the MONGODB_URI in your .env file');
    }
    
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ reputation: -1 });

    await db.collection('questions').createIndex({ author: 1 });
    await db.collection('questions').createIndex({ tags: 1 });
    await db.collection('questions').createIndex({ createdAt: -1 });
    await db.collection('questions').createIndex({ views: -1 });
    await db.collection('questions').createIndex({ 
      title: 'text', 
      content: 'text' 
    });

    await db.collection('answers').createIndex({ question: 1 });
    await db.collection('answers').createIndex({ author: 1 });
    await db.collection('answers').createIndex({ createdAt: -1 });

    console.log('✅ Database indexes created');
  } catch (error) {
    console.log('⚠️  Index creation warning:', error.message);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('✅ MongoDB connection closed');
  }
};

export { connectDB, getDB, closeDB };
export default connectDB;