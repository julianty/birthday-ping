"use client";
import React, { useState } from "react";
import { Reminder } from "@/app/types";
import { submitReminder } from "@/app/dashboard/actions";
import { useSession } from "next-auth/react";
import GroupSelect from "./group-select";

function AddReminderForm() {
  const { data: session, status } = useSession();
  const [userEmail, setUserEmail] = useState<string | undefined>("");
  const [newReminder, setNewReminder] = useState<Reminder>({
    id: 1,
    name: "",
    date: "",
  });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  React.useEffect(() => {
    if (status === "authenticated") {
      setUserEmail(session?.user?.email ?? undefined);
    }
  }, [status, session]);

  return (
    <form action={submitReminder} className="flex flex-col gap-4 items-center">
      <input name="email" value={userEmail} readOnly hidden />
      <input name="groupId" value={selectedGroupId ?? ""} readOnly hidden />
      <input
        name="name"
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
        name="date"
        type="date"
        value={newReminder.date}
        onChange={(e) =>
          setNewReminder({ ...newReminder, date: e.target.value })
        }
        className="px-4 py-2 rounded border w-full"
        required
      />
      <GroupSelect
        value={selectedGroupId ?? undefined}
        onChange={(gId) => setSelectedGroupId(gId)}
        className="w-full text-left"
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
