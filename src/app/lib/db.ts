import { MongoClient } from "mongodb";

export async function addReminder() {
  const uri = process.env.MONGO_DB_CONNECTION_STRING!;
  if (!uri)
    throw new Error("MONGO_DB_CONNECTION_STRING env variable not configured");
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("reminders");
    const testReminders = db.collection("test-reminders");

    const result = await testReminders.insertOne({ date: "01-01-26" });
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  } finally {
    await client.close();
  }
}
