import { MongoClient, ObjectId, WithId } from "mongodb";
import type { CreateReminder } from "@/app/schemas/reminder.schema";
import {
  CreateBirthday,
  UpdateBirthday,
  BirthdayDB,
} from "../schemas/birthday.schema";
import { UserDB } from "../schemas/user.schema";
import {
  CreateSubscription,
  SubscriptionDB,
} from "../schemas/subscription.schema";

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
    const db = client.db(process.env.MONGO_DB_NAME || "test");
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
    const db = client.db(process.env.MONGO_DB_NAME || "test");
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
    const db = client.db(process.env.MONGO_DB_NAME || "test");

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

export async function deleteBirthday(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME || "test");
    const birthdays = db.collection<BirthdayDB>("birthdays");

    const oid = new ObjectId(id);
    const result: BirthdayDB | null = await birthdays.findOneAndDelete({
      _id: oid,
    });
    // result.value will be the deleted document or null
    return result ?? null;
  } catch (e) {
    if (e instanceof Error) console.error(e.message);
    throw e;
  }
}

export async function updateBirthday(id: string, update: UpdateBirthday) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME || "test");
    const birthdays = db.collection<BirthdayDB>("birthdays");

    const result = await birthdays.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" },
    );
    return result ?? null;
  } catch (e) {
    if (e instanceof Error) console.error(e.message);
    throw e;
  }
}

export async function getBirthdaysByMonth(month: number) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME || "test");

    // Query by month
    const birthdaysCol = db.collection<BirthdayDB>("birthdays");
    const birthdaysQuery = await birthdaysCol.find({
      month: month,
    });

    if (!birthdaysQuery) {
      throw new Error("could not complete getBirthdaysByMonth query operation");
    }
    // Return results
    return birthdaysQuery.toArray();
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
}

export async function getSubscriptionsByBirthdayMonth(month: number) {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    const subscriptions = db.collection<SubscriptionDB>("subscriptions");

    const pipeline = [
      {
        $lookup: {
          from: "birthdays",
          localField: "birthdayId",
          foreignField: "_id",
          as: "birthdays",
        },
      },
      { $unwind: "$birthdays" },
      {
        $match: {
          "birthdays.month": month,
        },
      },
    ];

    return subscriptions.aggregate(pipeline).toArray();
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
}

export type SubscriptionShape = {
  subscriptionId: ObjectId;
  birthday: {
    _id: ObjectId;
    name: string;
    date: Date;
    month: number;
    day: number;
    createdBy: ObjectId;
  };
};

export type UserGroupedSubscriptions = {
  _id: ObjectId;
  subscriptions: SubscriptionShape[];
  userId: ObjectId;
  userEmail: string;
  filteredMonth: number;
};
export async function getMonthBirthdaySubscriptionsGroupedByUser(
  month: number,
) {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    const subscriptions = db.collection<SubscriptionDB>("subscriptions");

    const pipeline = [
      {
        $lookup: {
          from: "birthdays",
          localField: "birthdayId",
          foreignField: "_id",
          as: "birthday",
        },
      },
      { $unwind: "$birthday" },
      {
        $match: {
          "birthday.month": month,
        },
      },
      {
        $group: {
          _id: "$userId",
          subscriptions: {
            $push: {
              subscriptionId: "$_id",
              birthday: "$birthday",
              lastSentAt: "$lastSentAt",
            },
          },
          month: { $first: "$birthday.month" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          userId: "$_id",
          userEmail: "$user.email",
          subscriptions: 1,
          filteredMonth: "$month",
        },
      },
    ];

    return subscriptions.aggregate(pipeline).toArray();
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
}

export async function updateLastSentAt(
  subscriptionIds: ObjectId[],
  sentAt = new Date(),
) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const subs = db.collection("subscriptions");

  const ops = subscriptionIds.map((id) => ({
    updateOne: {
      filter: { _id: typeof id === "string" ? new ObjectId(id) : id },
      update: { $set: { lastSentAt: sentAt } },
    },
  }));

  const result = await subs.bulkWrite(ops);
  return result; // contains matchedCount / modifiedCount etc
}

export async function getUserBirthdaysByDate(
  userId: ObjectId | string,
  date: Date,
) {
  const uid = userId instanceof ObjectId ? userId : new ObjectId(userId);
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");

  const subscriptions = db.collection("subscriptions");
  const month = date.getMonth() + 1;
  const day = date.getUTCDate();

  const pipeline = [
    {
      $match: { userId: uid },
    },
    {
      $lookup: {
        from: "birthdays",
        localField: "birthdayId",
        foreignField: "_id",
        as: "birthday",
      },
    },
    {
      $unwind: "$birthday",
    },
    {
      $match: {
        $and: [{ "birthday.month": month }, { "birthday.day": day }],
      },
    },
    // {
    //   $match: { "birthday.day": day + 1 },
    // },
  ];

  const aggregationResult = await subscriptions.aggregate(pipeline).toArray();
  return aggregationResult;
}

export async function getUserIdFromEmail(userEmail: string) {
  const client = await clientPromise;
  const db = client.db("test");
  const users = db.collection<UserDB>("users");

  const user = await users.findOne({ email: userEmail });
  const uid = user?._id;
  return uid;
}

export async function getRefreshToken(uid: string | ObjectId) {
  const userId = typeof uid === "string" ? new ObjectId(uid) : uid;
  const client = await clientPromise;
  const db = client.db("test");
  const acct = await db.collection("accounts").findOne({
    provider: "google",
    userId,
  });
  return acct?.refresh_token ?? null;
}
