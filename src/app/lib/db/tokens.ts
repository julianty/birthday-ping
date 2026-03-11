import { ObjectId } from "mongodb";
import { clientPromise } from "./connection";

export async function getRefreshToken(
  uid: string | ObjectId,
): Promise<string | null> {
  const userId = typeof uid === "string" ? new ObjectId(uid) : uid;
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");
  const acct = await db.collection("accounts").findOne({
    provider: "google",
    userId,
  });
  return acct?.refresh_token ?? null;
}

export async function updateRefreshToken(
  userId: ObjectId,
  newRefreshToken: string,
  newAccessToken?: string | null,
) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");

  await db.collection("accounts").updateOne(
    { userId, provider: "google" },
    {
      $set: {
        refresh_token: newRefreshToken,
        ...(newAccessToken && { access_token: newAccessToken }),
      },
    },
  );
}
