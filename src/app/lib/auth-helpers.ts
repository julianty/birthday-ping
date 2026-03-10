import { clientPromise } from "./db";
import type { Account } from "next-auth";

/**
 * Persist the latest OAuth tokens from a sign-in event into the
 * `accounts` collection.  The MongoDB adapter only writes tokens on
 * *initial* account linking — returning users keep stale values.
 * Calling this from `events.signIn` guarantees every login refreshes
 * the stored tokens.
 */
export async function syncAccountTokens(
  userEmail: string,
  account: Account,
): Promise<void> {
  if (account.provider !== "google") return;
  if (!account.refresh_token) {
    console.warn(
      `⚠️ syncAccountTokens: no refresh_token in sign-in for ${userEmail}`,
    );
    return;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGO_DB_NAME || "test");

  const user = await db.collection("users").findOne({ email: userEmail });
  if (!user) {
    console.error(`syncAccountTokens: user ${userEmail} not found`);
    return;
  }

  const result = await db.collection("accounts").updateOne(
    { userId: user._id, provider: "google" },
    {
      $set: {
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expires_at: account.expires_at,
        scope: account.scope,
        token_type: account.token_type,
        id_token: account.id_token,
      },
    },
  );

  console.log("🔄 syncAccountTokens:", {
    userEmail,
    matched: result.matchedCount,
    modified: result.modifiedCount,
  });
}
