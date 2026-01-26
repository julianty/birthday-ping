"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import AddReminderForm from "../components/add-reminder-form";
import { Reminder } from "../types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [reminders, setReminders] = useState([
    // Example reminders
    { id: 1, name: "Alice's Birthday", date: "2026-02-14" },
    { id: 2, name: "Bob's Birthday", date: "2026-03-01" },
  ]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="mb-6">You must be signed in to view your reminders.</p>
      </main>
    );
  }

  function handleAddReminder(reminder: Reminder) {
    setReminders([
      ...reminders,
      {
        id: reminders.length + 1,
        name: reminder.name,
        date: reminder.date,
      },
    ]);
  }

  async function handleSendSummary() {
    if (!session?.user?.email) return;
    const summary =
      reminders.length === 0
        ? "No reminders yet."
        : reminders.map((r) => `- ${r.name} on ${r.date}`).join("\n");
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: session.user.email,
        subject: "Your Birthday Reminders Summary",
        text: summary,
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Summary sent!");
    } else {
      alert("Error: " + (data.error || "Failed to send email."));
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-zinc-900 rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Your Reminders</h1>
        <ul className="mb-6 text-left">
          {reminders.length === 0 ? (
            <li className="text-zinc-500">No reminders yet.</li>
          ) : (
            reminders.map((reminder) => (
              <li key={reminder.id} className="mb-2">
                <span className="font-semibold">{reminder.name}</span> —{" "}
                <span>{reminder.date}</span>
              </li>
            ))
          )}
        </ul>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={handleSendSummary}
        >
          Send Reminders Summary
        </button>
        <AddReminderForm onAdd={handleAddReminder} />
      </div>
    </main>
  );
}
