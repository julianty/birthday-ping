"use server";

import { BirthdayPlainObject } from "../schemas/birthday.schema";
import { auth } from "@/app/auth";
import {
  getMonthBirthdaySubscriptionsGroupedByUser,
  getRefreshToken,
  getUserBirthdaysByDate,
  getUserIdFromEmail,
  SubscriptionShape,
  updateLastSentAt,
  UserGroupedSubscriptions,
} from "./db";
import { google } from "googleapis";

async function SendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }
  // These should be set in your environment variables
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const uid = await getUserIdFromEmail(session.user.email);
  const refreshToken = await getRefreshToken(uid!);

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri,
  );
  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const messageParts = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    `Subject: ${subject}`,
    "",
    text,
  ];
  const message = messageParts.join("\n");
  const encodedMessage = Buffer.from(message).toString("base64url");

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
  }
}

export async function sendReminderEmail(birthdays: BirthdayPlainObject[]) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No user email");

  const body = {
    to: session.user.email,
    subject: "Here are all of the birthdays associated with your account!",
    text: birthdays
      .map((r) => `${r.name}: ${r.date.toDateString()}`)
      .join("\n"),
  };
  SendEmail(body);
}

export async function sendMonthlyEmail() {
  const currentMonth = new Date().getMonth() + 1;

  // Aggregate subscriptions per user
  const subscriptionsByUser = (await getMonthBirthdaySubscriptionsGroupedByUser(
    currentMonth,
  )) as unknown as UserGroupedSubscriptions[];
  if (!subscriptionsByUser) {
    throw new Error(
      "Could not query aggregation pipeline getMonthBirthdaySubscriptionsGroupedByUser",
    );
  }
  // Call send monthly email api for each user
  for (const doc of subscriptionsByUser) {
    const body = {
      to: doc.userEmail,
      subject: `Birthdays for the month of ${doc.filteredMonth}`,
      text: doc.subscriptions
        .map((subscription: SubscriptionShape) => {
          const bday = subscription.birthday;
          return `${bday.name}: ${bday.month}/${bday.day}/${new Date(bday.date).getFullYear()}`;
        })
        .join("\n"),
    };

    SendEmail(body);
    // Update subscription lastSentAt
    const updateResult = await updateLastSentAt(
      doc.subscriptions.map((sub) => sub.subscriptionId),
    );
  }
}

export async function sendDailyEmail(userEmail: string) {
  const uid = await getUserIdFromEmail(userEmail);
  if (!uid) {
    throw new Error("Could not fetch userId from email");
  }

  // Find all subscriptions that have a birthday landing today
  const todayDate = new Date();
  const birthdays = await getUserBirthdaysByDate(uid, todayDate);

  const body = {
    to: userEmail,
    subject: `You have ${birthdays.length} birthday subscriptions active today`,
    text: birthdays
      .map(
        (bd) => `${bd.birthday.name}: ${bd.birthday.month}/${bd.birthday.day}`,
      )
      .join("\n"),
  };

  SendEmail(body);

  // Send email to user
  // Update lastSent at
  const subscriptionIds = birthdays.map((bd) => bd._id);
  const updateResponse = updateLastSentAt(subscriptionIds);
}
