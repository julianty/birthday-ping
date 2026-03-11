import { ObjectId } from "mongodb";
import { UserDB } from "../../schemas/user.schema";
import { clientPromise } from "./connection";

export async function getUserIdFromEmail(
  userEmail: string,
): Promise<ObjectId | undefined> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const users = db.collection<UserDB>("users");

  const user = await users.findOne({ email: userEmail });
  return user?._id;
}
