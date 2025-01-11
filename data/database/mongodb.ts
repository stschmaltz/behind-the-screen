import { Db, MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.DB_NAME;

if (!MONGODB_URI) {
  throw new Error('Define the MONGODB_URI environmental variable');
}

if (!MONGODB_DB) {
  throw new Error('Define the MONGODB_DB environmental variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function getDbClient(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  if (cachedClient && cachedDb) {
    return {
      client: cachedClient,
      db: cachedDb,
    };
  }

  const opts = {};

  const client = MONGODB_URI && new MongoClient(MONGODB_URI, opts);

  if (!client) throw new Error('MongoDB client not found.');

  await client.connect();
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return {
    client: cachedClient,
    db: cachedDb,
  };
}

export { getDbClient };
