"use client";
import React, { useState } from "react";
import { Reminder } from "@/app/types";
import { submitReminder } from "@/app/dashboard/actions";
import { useSession } from "next-auth/react";
import GroupSelect from "./group-select";
import { createPortal } from "react-dom";

function AddReminderForm() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>("");
  const [newReminder, setNewReminder] = useState<Reminder>({
    id: 1,
    name: "",
    month: "",
    day: "",
    year: "",
  });
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  React.useEffect(() => {
    if (status === "authenticated") {
      setUserEmail(session?.user?.email ?? undefined);
    }
  }, [status, session]);

  function handleClose() {
    setIsOpen(false);
    setNewReminder({ id: 1, name: "", month: "", day: "", year: "" });
    setSelectedGroupId(null);
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent-hover active:scale-95 transition-all flex items-center justify-center"
        aria-label="Add reminder"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {/* Bottom-sheet modal */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          >
            <div
              className="w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-xl p-6 animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Add Birthday</h2>
                <button
                  onClick={handleClose}
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

              <form action={submitReminder} className="space-y-4">
                <input name="email" value={userEmail} readOnly hidden />
                <input
                  name="groupId"
                  value={selectedGroupId ?? ""}
                  readOnly
                  hidden
                />

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted">Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={newReminder.name}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted/60 text-base"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted">
                    Birthday
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      name="month"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={12}
                      placeholder="MM"
                      value={newReminder.month}
                      onChange={(e) =>
                        setNewReminder({
                          ...newReminder,
                          month: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-base"
                      required
                    />
                    <input
                      name="day"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={31}
                      placeholder="DD"
                      value={newReminder.day}
                      onChange={(e) =>
                        setNewReminder({ ...newReminder, day: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-base"
                      required
                    />
                    <input
                      name="year"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={9999}
                      placeholder="YYYY"
                      value={newReminder.year}
                      onChange={(e) =>
                        setNewReminder({ ...newReminder, year: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-base"
                    />
                  </div>
                  <p className="text-xs text-muted">Year is optional.</p>
                </div>

                <GroupSelect
                  value={selectedGroupId ?? undefined}
                  onChange={(gId) => setSelectedGroupId(gId)}
                  className="w-full text-left"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover active:scale-[0.98] transition-all text-base"
                >
                  Add Reminder
                </button>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default AddReminderForm;
