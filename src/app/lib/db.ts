import { MongoClient, ObjectId, WithId } from "mongodb";
import type { CreateReminder } from "@/app/schemas/reminder.schema";
import { CreateBirthday } from "../schemas/birthday.schema";
import { UserDB } from "../schemas/user.schema";
import { CreateSubscription } from "../schemas/subscription.schema";

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

export async function getReminders(userEmail: string) {
  try {
    const client = await clientPromise;
    const db = client.db("test");
    // Find user with email
    const users = db.collection("users");
    const findUser = await users.findOne({
      email: userEmail,
    });
    const userId = findUser?._id;

    // Collect all user's subscriptions
    const subscriptions = await db
      .collection<{ birthdayId: ObjectId }>("subscriptions")
      .find({ userId })
      .toArray();

    const birthdayIds = subscriptions.map((s) => s.birthdayId);
    if (birthdayIds.length === 0) return [];

    // Collect all birthdays
    const birthdays = await db
      .collection<WithId<CreateBirthday>>("birthdays")
      .find({ _id: { $in: birthdayIds } })
      .toArray();

    return birthdays;
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
}

export async function addSubscription(
  userEmail: string,
  birthdayData: Omit<CreateBirthday, "createdBy">,
) {
  try {
    // Connect to database
    const client = await clientPromise;
    const db = client.db("test");

    // Find user in database
    const users = db.collection("users");
    const userDB: UserDB | null = await users.findOne<UserDB>({
      email: userEmail,
    });
    if (!userDB) {
      console.error(`User with email: ${userEmail} not found`);
      return;
    }
    const userId = userDB._id;

    // Add birthday to database
    const birthdays = db.collection("birthdays");
    const completeBirthdayData = { ...birthdayData, createdBy: userId };
    const insertBirthdayResult =
      await birthdays.insertOne(completeBirthdayData);
    if (!insertBirthdayResult.acknowledged) {
      console.error(`Error adding new birthday`);
      return;
    }
    const birthdayId = insertBirthdayResult.insertedId;
    // Add subscription to database
    const subscriptions = db.collection("subscriptions");
    const subscriptionData = {
      userId,
      birthdayId,
    } satisfies CreateSubscription;
    const insertSubscriptionResult =
      await subscriptions.insertOne(subscriptionData);
    if (!insertSubscriptionResult.acknowledged) {
      console.error(`Error adding new subscription`);
      return;
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
}
