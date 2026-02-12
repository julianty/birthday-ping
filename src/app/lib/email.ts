"use server";

import { BirthdayPlainObject } from "../schemas/birthday.schema";
import { auth } from "@/app/auth";
import {
  getMonthBirthdaySubscriptionsGroupedByUser,
  SubscriptionShape,
  updateLastSentAt,
  UserGroupedSubscriptions,
} from "./db";

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
  subscriptionsByUser.forEach(async (doc) => {
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
  });
}
