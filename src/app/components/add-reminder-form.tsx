import React, { useState } from "react";
import { Reminder } from "@/app/types";

interface AddReminderFormProps {
  onAdd: (reminder: Reminder) => void;
}

function AddReminderForm({ onAdd }: AddReminderFormProps) {
  const [newReminder, setNewReminder] = useState<Reminder>({
    id: 1,
    name: "",
    date: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newReminder.name || !newReminder.date) return;
    onAdd({ id: 0, name: newReminder.name, date: newReminder.date });
    setNewReminder({ id: 0, name: "", date: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
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
  );
}

export default AddReminderForm;
