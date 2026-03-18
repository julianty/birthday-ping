"use server";

import { BirthdayPlainObject } from "../schemas/birthday.schema";
import { auth } from "@/app/auth";
import { formatBirthdayLabel } from "./date.utils";
import {
  getMonthBirthdaySubscriptionsGroupedByUser,
  getUserBirthdaysByDate,
  getUserIdFromEmail,
  SubscriptionShape,
  updateLastSentAt,
  UserGroupedSubscriptions,
} from "./db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function SendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }
  if (!from) {
    throw new Error("Missing RESEND_FROM_EMAIL");
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      text,
    });

    if (error) {
      throw new Error(error.message || "Resend failed to send email");
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Unknown email sending error");
  }
}

export async function sendReminderEmail(birthdays: BirthdayPlainObject[]) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No user email");

  const body = {
    to: session.user.email,
    subject: "Here are all of the birthdays associated with your account!",
    text: birthdays
      .map((r) => `${r.name}: ${formatBirthdayLabel(r.month, r.day, r.year)}`)
      .join("\n"),
  };
  await SendEmail(body);
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
          return `${bday.name}: ${formatBirthdayLabel(
            bday.month,
            bday.day,
            bday.year,
          )}`;
        })
        .join("\n"),
    };

    await SendEmail(body);
    // Update subscription lastSentAt
    await updateLastSentAt(doc.subscriptions.map((sub) => sub.subscriptionId));
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

  await SendEmail(body);

  // Send email to user
  // Update lastSent at
  const subscriptionIds = birthdays.map((bd) => bd._id);
  await updateLastSentAt(subscriptionIds);
}
