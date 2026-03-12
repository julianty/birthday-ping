"use client";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import { useRouter } from "next/navigation";
import React from "react";
import { createPortal } from "react-dom";
import GroupSelect from "./group-select";

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
  const [groupId, setGroupId] = React.useState<string | null>(null);
  const [groupName, setGroupName] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const router = useRouter();

  // Have ui react to changes in birthday
  React.useEffect(() => {
    if (birthday) {
      const year = birthday.date.getFullYear();
      setName(birthday.name ?? "");
      setGroupId(birthday.groupId ?? null);
      setGroupName(birthday.groupName ?? null);
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
        groupId: groupId ?? undefined,
        groupName: groupName ?? undefined,
      };

      // apply optimistic update to parent immediately
      try {
        onSaved?.(optimistic);
      } catch (err) {
        console.warn("onSaved callback threw", err);
      }

      // Save birthday fields
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

      // Save group change if it differs
      const groupChanged =
        (groupId ?? undefined) !== (birthday.groupId ?? undefined);
      if (groupChanged) {
        const groupRes = await fetch(`/api/subscriptions/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupId: groupId ?? null }),
        });
        if (!groupRes.ok) {
          console.error("Group PATCH failed:", await groupRes.text());
        }
      }

      const updated = await res.json();
      // normalize server response to BirthdayPlainObject (convert date string to Date)
      const canonical: BirthdayPlainObject = {
        ...birthday,
        ...updated,
        date: updated.date ? new Date(updated.date) : birthday.date,
        groupId: groupId ?? undefined,
        groupName: groupName ?? undefined,
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

  const initial = (birthday.name ?? "?").charAt(0).toUpperCase();

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-xl p-6 animate-slide-up"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent font-semibold text-sm shrink-0">
            {initial}
          </div>
          <h2 className="text-lg font-semibold flex-1 truncate">
            Edit Birthday
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground p-1 -mr-1 rounded-lg hover:bg-border/50 transition-colors"
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">Name</label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="name"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted">Birthday</label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-base"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="date"
              required
            />
          </div>

          <GroupSelect
            value={groupId ?? undefined}
            onChange={(gId, gName) => {
              setGroupId(gId);
              setGroupName(gName);
            }}
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className={`text-sm text-destructive hover:text-destructive-hover font-medium transition-colors ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Delete birthday
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-border/50 transition-colors"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium bg-accent text-white ${saving ? "opacity-60 cursor-not-allowed" : "hover:bg-accent-hover active:scale-[0.98]"} transition-all`}
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
