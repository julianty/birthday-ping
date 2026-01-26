import { MongoClient } from "mongodb";
import { Reminder } from "@/app/types";

export async function addReminder(reminder: Omit<Reminder, "id">) {
  const uri = process.env.MONGO_DB_CONNECTION_STRING!;
  if (!uri)
    throw new Error("MONGO_DB_CONNECTION_STRING env variable not configured");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("reminders");
    const testReminders = db.collection("test-reminders");

    const result = await testReminders.insertOne(reminder);
    return result;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  } finally {
    await client.close();
  }
}
