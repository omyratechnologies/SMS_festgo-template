// lib/mongodb.ts
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // Allow global var reuse in dev (Next.js hot reload)
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Connect to MongoDB and return client and database.
 * Uses the database specified in the URI; falls back to "test".
 */
export async function connectToDatabase(): Promise<{
  db: Db;
  client: MongoClient;
}> {
  const client = await clientPromise;

  // Use the database from the URI if specified, otherwise fallback
  const dbName = client.db().databaseName || "test";
  const db = client.db(dbName);

  return { db, client };
}
