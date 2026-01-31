"use server";

import type { ReminderDB } from "../schemas/reminder.schema";
import { auth } from "@/app/auth";

export async function sendReminderEmail(reminders: ReminderDB[]) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No user email");

  const headers = {
    "Content-Type": "application/json",
  };

  const body = {
    to: session.user.email,
    subject: "Here are all of the birthdays associated with your account!",
    text: reminders.map((r) => `${r.name}: ${r.date}`).join("\n"),
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
