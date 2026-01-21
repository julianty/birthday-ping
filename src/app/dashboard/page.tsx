"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [reminders, setReminders] = useState([
    // Example reminders
    { id: 1, name: "Alice's Birthday", date: "2026-02-14" },
    { id: 2, name: "Bob's Birthday", date: "2026-03-01" },
  ]);
  const [newReminder, setNewReminder] = useState({ name: "", date: "" });

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

  function handleAddReminder(e) {
    e.preventDefault();
    if (!newReminder.name || !newReminder.date) return;
    setReminders([
      ...reminders,
      {
        id: reminders.length + 1,
        name: newReminder.name,
        date: newReminder.date,
      },
    ]);
    setNewReminder({ name: "", date: "" });
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-pink-100 via-sky-100 to-orange-100">
      <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
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
        <form
          onSubmit={handleAddReminder}
          className="flex flex-col gap-4 items-center"
        >
          <input
            type="text"
            placeholder="Name"
            value={newReminder.name}
            onChange={(e) =>
              setNewReminder({ ...newReminder, name: e.target.value })
            }
            className="px-4 py-2 rounded border w-full"
            required
          />
          <input
            type="date"
            value={newReminder.date}
            onChange={(e) =>
              setNewReminder({ ...newReminder, date: e.target.value })
            }
            className="px-4 py-2 rounded border w-full"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Add Reminder
          </button>
        </form>
      </div>
    </main>
  );
}
