import { MongoClient } from "mongodb";
import { Reminder } from "@/app/types";
import type { CreateReminder } from "@/app/schemas/reminder.schema";
import * as z from "zod";

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

export async function addReminder(reminder: CreateReminder) {
  try {
    const client = await clientPromise;
    const db = client.db("test");
    const testReminders = db.collection("test-reminders");

    const result = await testReminders.insertOne(reminder);
    return result;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
}

export async function getReminders(email: string) {
  try {
    const client = await clientPromise;
    const db = client.db("test");
    const testReminders = db.collection("test-reminders");

    const result = await testReminders.find({
      email: email,
    });

    return result.toArray();
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
}
