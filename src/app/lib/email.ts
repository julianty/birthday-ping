"use server";

import { BirthdayPlainObject } from "../schemas/birthday.schema";
import { auth } from "@/app/auth";
import {
  getMonthBirthdaySubscriptionsGroupedByUser,
  getUserBirthdaysByDate,
  getUserIdFromEmail,
  SubscriptionShape,
  updateLastSentAt,
  UserGroupedSubscriptions,
} from "./db";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";

export async function sendReminderEmail(birthdays: BirthdayPlainObject[]) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No user email");

  const headers = {
    "Content-Type": "application/json",
  };

  const body = {
    to: session.user.email,
    subject: "Here are all of the birthdays associated with your account!",
    text: birthdays
      .map((r) => `${r.name}: ${r.date.toDateString()}`)
      .join("\n"),
  };

  // Build an absolute URL for the internal API route to avoid issues when
  // calling from a server environment. Prefer a runtime-configured base URL.
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";
  const url = new URL("/api/send-email", base).toString();

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`send-email failed: ${res.status} ${text}`);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw error;
    }
    throw new Error("Unknown error sending reminder email");
  }
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
    const headers = {
      "Content-Type": "application/json",
    };
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
    // Build an absolute URL for the internal API route to avoid issues when
    // calling from a server environment. Prefer a runtime-configured base URL.
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3000";
    const url = new URL("/api/send-email", base).toString();

    try {
      // Send email
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`send-email failed: ${res.status} ${text}`);
      }
      // Update subscription lastSentAt
      const updateResult = await updateLastSentAt(
        doc.subscriptions.map((sub) => sub.subscriptionId),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        throw error;
      }
      throw new Error("Unknown error sending reminder email");
    }
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
  console.log(birthdays);
  if (birthdays.length == 0) {
    console.log(`no birthdays at this date: ${todayDate}`);
    return;
  }
  // Send email to user
  try {
    // Build an absolute URL for the internal API route to avoid issues when
    // calling from a server environment. Prefer a runtime-configured base URL.
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3000";
    const url = new URL("/api/send-email", base).toString();
    const headers = {
      "Content-Type": "application/json",
    };
    const body = {
      to: userEmail,
      subject: `You have ${birthdays.length} birthday subscriptions active today`,
      text: birthdays
        .map(
          (bd) =>
            `${bd.birthday.name}: ${bd.birthday.month}/${bd.birthday.day}`,
        )
        .join("\n"),
    };
    const res = await fetch(url, {
      method: "post",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("send daily email failed", res.status, text);
    }
    // Update lastSent at
    const subscriptionIds = birthdays.map((bd) => bd._id);
    const updateResponse = updateLastSentAt(subscriptionIds);
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
  }
}
