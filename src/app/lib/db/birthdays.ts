import { ObjectId } from "mongodb";
import { BirthdayDB, UpdateBirthday } from "../../schemas/birthday.schema";
import { clientPromise } from "./connection";

export type BirthdayWithGroup = BirthdayDB & {
  groupId?: ObjectId;
  groupName?: string;
};

export async function getReminders(
  userEmail: string,
): Promise<BirthdayWithGroup[] | undefined> {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME || "test");

    const user = await db.collection("users").findOne({ email: userEmail });
    if (!user) return [];
    const userId = user._id;

    const pipeline = [
      { $match: { userId } },
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
        $lookup: {
          from: "groups",
          localField: "groupId",
          foreignField: "_id",
          as: "group",
        },
      },
      { $unwind: { path: "$group", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$birthday._id",
          name: "$birthday.name",
          date: "$birthday.date",
          month: "$birthday.month",
          day: "$birthday.day",
          createdBy: "$birthday.createdBy",
          groupId: "$groupId",
          groupName: "$group.name",
        },
      },
    ];

    return db
      .collection("subscriptions")
      .aggregate<BirthdayWithGroup>(pipeline)
      .toArray();
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
}

export async function getBirthdaysByMonth(month: number) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME || "test");

    const birthdaysCol = db.collection<BirthdayDB>("birthdays");
    const birthdaysQuery = await birthdaysCol.find({ month });

    if (!birthdaysQuery) {
      throw new Error("could not complete getBirthdaysByMonth query operation");
    }
    return birthdaysQuery.toArray();
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(e.message);
    }
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

export async function deleteBirthday(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGO_DB_NAME || "test");
    const birthdays = db.collection<BirthdayDB>("birthdays");

    const oid = new ObjectId(id);
    const result: BirthdayDB | null = await birthdays.findOneAndDelete({
      _id: oid,
    });
    return result ?? null;
  } catch (e) {
    if (e instanceof Error) console.error(e.message);
    throw e;
  }
}
