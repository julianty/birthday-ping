"use client";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import { useRouter } from "next/navigation";
import React from "react";
import { createPortal } from "react-dom";

interface BirthdayItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  birthday: BirthdayPlainObject;
  onSaved: (updated: BirthdayPlainObject) => void;
}

function BirthdayItemModal({
  isOpen,
  onClose,
  birthday,
  onSaved,
}: BirthdayItemModalProps) {
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const router = useRouter();

  // Have ui react to changes in birthday
  React.useEffect(() => {
    if (birthday) {
      const year = birthday.date.getFullYear();
      setName(birthday.name ?? "");
      const pad = (n: number) => String(n).padStart(2, "0");
      if (year && birthday.month && birthday.day) {
        setDate(`${year}-${pad(birthday.month)}-${pad(birthday.day)}`);
      } else if (birthday.date) {
        setDate(birthday.date.toString());
      } else {
        setDate("");
      }
    }
  }, [birthday]);

  // Return nothing if modal is not open
  if (!isOpen) return null;

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const id = birthday._id;
      // prepare optimistic update object
      const [y, m, d] = date.split("-").map((s) => Number(s));
      const optimistic: BirthdayPlainObject = {
        ...birthday,
        name,
        date: new Date(date),
        month: Number(m) || birthday.month,
        day: Number(d) || birthday.day,
      };

      // apply optimistic update to parent immediately
      try {
        onSaved?.(optimistic);
      } catch (err) {
        console.warn("onSaved callback threw", err);
      }
      const res = await fetch(`/api/birthdays/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("PATCH failed:", text);
        // rollback optimistic update
        try {
          onSaved(birthday);
        } catch (err) {
          console.warn("onSaved rollback threw", err);
        }
        alert("Failed to save birthday");
        return;
      }

      const updated = await res.json();
      // normalize server response to BirthdayPlainObject (convert date string to Date)
      const canonical: BirthdayPlainObject = {
        ...birthday,
        ...updated,
        date: updated.date ? new Date(updated.date) : birthday.date,
      };
      try {
        onSaved(canonical);
      } catch (err) {
        console.warn("onSaved after save threw", err);
      }

      onClose();
    } catch (err) {
      console.error("Error saving birthday:", err);
      // rollback optimistic update on error
      try {
        onSaved(birthday);
      } catch (e) {
        console.warn("onSaved rollback threw", e);
      }
      alert("Failed to save birthday");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this birthday? This action cannot be undone.")) return;
    setSaving(true);
    try {
      const id = birthday._id;
      const res = await fetch(`/api/birthdays/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("DELETE failed:", text);
        alert("Failed to delete birthday");
        return;
      }
      onClose();
    } catch (err) {
      console.error("Error deleting birthday:", err);
      alert("Failed to delete birthday");
    } finally {
      setSaving(false);
      router.refresh();
    }
  }
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10 bg-black/40 backdrop-blur-sm"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-background text-foreground rounded-2xl shadow-xl p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-1 gap-1">
            <label className="text-sm font-medium">Name</label>
            <input
              className="px-3 py-2 rounded border"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="name"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-1">
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              className="px-3 py-2 rounded border"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="date"
              required
            />
          </div>

          <div className="flex justify-between items-center gap-2 pt-2">
            <div>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className={`px-3 py-2 rounded text-white bg-red-600 hover:bg-red-700 ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                Delete
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded bg-gray-200 dark:bg-zinc-700"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-3 py-2 rounded bg-indigo-600 text-white ${saving ? "opacity-60 cursor-not-allowed" : "hover:bg-indigo-700"}`}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default BirthdayItemModal;
