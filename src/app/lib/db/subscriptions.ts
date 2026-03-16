import { ObjectId } from "mongodb";
import { CreateBirthday } from "../../schemas/birthday.schema";
import { UserDB } from "../../schemas/user.schema";
import {
  CreateSubscription,
  SubscriptionDB,
} from "../../schemas/subscription.schema";
import { clientPromise } from "./connection";

export type SubscriptionShape = {
  subscriptionId: ObjectId;
  birthday: {
    _id: ObjectId;
    name: string;
    date?: Date;
    month: number;
    day: number;
    year?: number;
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

export async function addSubscription(
  userEmail: string,
  birthdayData: Omit<CreateBirthday, "createdBy">,
  groupId?: string,
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME || "test");

    const users = db.collection("users");
    const userDB: UserDB | null = await users.findOne<UserDB>({
      email: userEmail,
    });
    if (!userDB) {
      console.error(`User with email: ${userEmail} not found`);
      return;
    }
    const userId = userDB._id;

    const birthdays = db.collection("birthdays");
    const completeBirthdayData = { ...birthdayData, createdBy: userId };
    const insertBirthdayResult =
      await birthdays.insertOne(completeBirthdayData);
    if (!insertBirthdayResult.acknowledged) {
      console.error(`Error adding new birthday`);
      return;
    }
    const birthdayId = insertBirthdayResult.insertedId;

    const subscriptions = db.collection("subscriptions");
    const subscriptionData: CreateSubscription = {
      userId,
      birthdayId,
      ...(groupId ? { groupId: new ObjectId(groupId) } : {}),
    };
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

export async function addSubscriptionsBulk(
  userEmail: string,
  entries: Array<{
    birthdayData: Omit<CreateBirthday, "createdBy">;
    groupId?: string;
  }>,
) {
  if (entries.length === 0) return 0;

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");

  const users = db.collection<UserDB>("users");
  const userDB = await users.findOne({ email: userEmail });
  if (!userDB) {
    throw new Error(`User with email ${userEmail} not found`);
  }

  const birthdays = db.collection("birthdays");
  const subscriptions = db.collection("subscriptions");
  let insertedCount = 0;

  for (const entry of entries) {
    const birthdayResult = await birthdays.insertOne({
      ...entry.birthdayData,
      createdBy: userDB._id,
    });

    const subscriptionData: CreateSubscription = {
      userId: userDB._id,
      birthdayId: birthdayResult.insertedId,
      ...(entry.groupId ? { groupId: new ObjectId(entry.groupId) } : {}),
    };
    await subscriptions.insertOne(subscriptionData);

    insertedCount += 1;
  }

  return insertedCount;
}

export async function getSubscriptionsByBirthdayMonth(month: number) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME || "test");

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
      { $match: { "birthdays.month": month } },
    ];

    return subscriptions.aggregate(pipeline).toArray();
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
  }
}

export async function getMonthBirthdaySubscriptionsGroupedByUser(
  month: number,
) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME || "test");

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
      { $match: { "birthday.month": month } },
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
      { $unwind: "$user" },
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

export async function updateSubscriptionGroup(
  birthdayId: ObjectId | string,
  userId: ObjectId | string,
  groupId: ObjectId | string | null,
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const subs = db.collection<SubscriptionDB>("subscriptions");

  const bid =
    typeof birthdayId === "string" ? new ObjectId(birthdayId) : birthdayId;
  const uid = typeof userId === "string" ? new ObjectId(userId) : userId;

  const update =
    groupId === null
      ? { $unset: { groupId: true as const } }
      : {
          $set: {
            groupId:
              typeof groupId === "string" ? new ObjectId(groupId) : groupId,
          },
        };

  const result = await subs.updateOne({ birthdayId: bid, userId: uid }, update);
  return result.modifiedCount > 0;
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
  return result;
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
    { $match: { userId: uid } },
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
        $and: [{ "birthday.month": month }, { "birthday.day": day }],
      },
    },
  ];

  return subscriptions.aggregate(pipeline).toArray();
}
