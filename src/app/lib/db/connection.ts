import { MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  const uri = process.env.MONGO_DB_CONNECTION_STRING!;
  if (!uri)
    throw new Error("MONGO_DB_CONNECTION_STRING env variable not configured");
  const client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

const clientPromise: Promise<MongoClient> = global._mongoClientPromise;
export { clientPromise };
