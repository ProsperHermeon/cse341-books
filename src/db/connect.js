import { MongoClient } from 'mongodb';

let client;
let db;

export async function connectToDb() {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }
  if (!dbName) {
    throw new Error('MONGODB_DB_NAME is not defined');
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDb first.');
  }
  return db;
}
