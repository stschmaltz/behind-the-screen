import { Db, MongoClient } from 'mongodb';
import { ensureIndexes } from './indexes';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.DB_NAME;

if (!MONGODB_URI) {
  throw new Error('Define the MONGODB_URI environmental variable');
}

if (!MONGODB_DB) {
  throw new Error('Define the MONGODB_DB environmental variable');
}

interface DbConnection {
  client: MongoClient;
  db: Db;
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoConnection?: Promise<DbConnection>;
};

const connect = async (uri: string, dbName: string): Promise<DbConnection> => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  void ensureIndexes(db);

  return { client, db };
};

async function getDbClient(): Promise<DbConnection> {
  if (!globalForMongo.mongoConnection) {
    const connection = connect(MONGODB_URI as string, MONGODB_DB as string);
    globalForMongo.mongoConnection = connection;
    connection.catch(() => {
      if (globalForMongo.mongoConnection === connection) {
        globalForMongo.mongoConnection = undefined;
      }
    });
  }

  return globalForMongo.mongoConnection;
}

export { getDbClient };
