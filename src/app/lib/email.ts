"use server";

import { type ReactElement, createElement } from "react";
import { render } from "@react-email/render";
import { BirthdayPlainObject } from "../schemas/birthday.schema";
import { auth } from "@/app/auth";
import {
  getMonthBirthdaySubscriptionsGroupedByUser,
  getUserBirthdaysByDate,
  getUserIdFromEmail,
  updateLastSentAt,
  UserGroupedSubscriptions,
} from "./db";
import { Resend } from "resend";
import DailyEmailTemplate from "../components/emails/daily-email-template";
import MonthlyEmailTemplate from "../components/emails/monthly-email-template";
import ReminderSummaryTemplate from "../components/emails/reminder-summary-template";
import {
  buildDailyEmailPayload,
  buildMonthlyEmailPayload,
  buildReminderSummaryPayload,
  type DailyBirthdayRecord,
} from "./email.payloads";

const resend = new Resend(process.env.RESEND_API_KEY);

async function SendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }
  if (!from) {
    throw new Error("Missing RESEND_FROM_EMAIL");
  }

  const html = await render(react);
  const text = await render(react, { plainText: true });

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
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

  const { to, subject, templateProps } = buildReminderSummaryPayload(
    session.user.email,
    birthdays,
  );
  await SendEmail({
    to,
    subject,
    react: createElement(ReminderSummaryTemplate, templateProps),
  });
}

export async function sendMonthlyEmail() {
  const currentMonth = new Date().getMonth() + 1;

  const subscriptionsByUser = (await getMonthBirthdaySubscriptionsGroupedByUser(
    currentMonth,
  )) as unknown as UserGroupedSubscriptions[];
  if (!subscriptionsByUser) {
    throw new Error(
      "Could not query aggregation pipeline getMonthBirthdaySubscriptionsGroupedByUser",
    );
  }

  for (const doc of subscriptionsByUser) {
    const { to, subject, templateProps } = buildMonthlyEmailPayload(doc);
    await SendEmail({
      to,
      subject,
      react: createElement(MonthlyEmailTemplate, templateProps),
    });
    await updateLastSentAt(doc.subscriptions.map((sub) => sub.subscriptionId));
  }
}

export async function sendDailyEmail(userEmail: string) {
  const uid = await getUserIdFromEmail(userEmail);
  if (!uid) {
    throw new Error("Could not fetch userId from email");
  }

  const todayDate = new Date();
  const birthdays = await getUserBirthdaysByDate(uid, todayDate);

  const { to, subject, templateProps } = buildDailyEmailPayload(
    userEmail,
    birthdays as unknown as DailyBirthdayRecord[],
    todayDate,
  );
  await SendEmail({
    to,
    subject,
    react: createElement(DailyEmailTemplate, templateProps),
  });

  const subscriptionIds = birthdays.map((bd) => bd._id);
  await updateLastSentAt(subscriptionIds);
}
