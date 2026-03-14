"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { BirthdayPlainObject } from "@/app/schemas/birthday.schema";

interface BirthdaySelectionExportProps {
  birthdays: BirthdayPlainObject[];
  isOpen: boolean;
  onClose: () => void;
  onContinue: (selectedIds: string[]) => void;
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatBirthdayDate(birthday: BirthdayPlainObject) {
  const monthLabel = MONTH_SHORT[birthday.month - 1] ?? String(birthday.month);
  return `${monthLabel} ${birthday.day}${birthday.year ? `, ${birthday.year}` : ""}`;
}

function BirthdaySelectionExport({
  birthdays,
  isOpen,
  onClose,
  onContinue,
}: BirthdaySelectionExportProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sortedBirthdays = useMemo(() => {
    return [...birthdays].sort((a, b) => {
      const groupA = a.groupName ?? "";
      const groupB = b.groupName ?? "";
      if (groupA !== groupB) return groupA.localeCompare(groupB);
      if (a.month !== b.month) return a.month - b.month;
      if (a.day !== b.day) return a.day - b.day;
      return a.name.localeCompare(b.name);
    });
  }, [birthdays]);

  const groupedBirthdays = useMemo(() => {
    const grouped = new Map<string, BirthdayPlainObject[]>();

    for (const birthday of sortedBirthdays) {
      const key = birthday.groupName ?? "Untagged";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(birthday);
    }

    return [...grouped.entries()];
  }, [sortedBirthdays]);

  const selectedCount = selectedIds.size;

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSelectAll() {
    setSelectedIds(new Set(sortedBirthdays.map((birthday) => birthday._id)));
  }

  function handleSelectTag(tagBirthdays: BirthdayPlainObject[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const birthday of tagBirthdays) next.add(birthday._id);
      return next;
    });
  }

  function handleClearTag(tagBirthdays: BirthdayPlainObject[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const birthday of tagBirthdays) next.delete(birthday._id);
      return next;
    });
  }

  function handleClear() {
    setSelectedIds(new Set());
  }

  function handleClose() {
    setSelectedIds(new Set());
    onClose();
  }

  function handleContinue() {
    if (selectedCount === 0) return;
    onContinue(Array.from(selectedIds));
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full sm:max-w-lg bg-card rounded-t-2xl sm:rounded-2xl shadow-xl p-6 animate-slide-up"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold">Select Birthdays</h2>
            <p className="text-sm text-muted">
              Choose which birthdays to include in export.
            </p>
          </div>
          <button
            type="button"
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

        {sortedBirthdays.length === 0 ? (
          <div className="rounded-xl border border-border bg-background px-4 py-6 text-center">
            <p className="text-sm text-muted">
              No birthdays available to export yet.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted">{selectedCount} selected</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-xl border border-border divide-y divide-border bg-background">
              {groupedBirthdays.map(([tagName, tagBirthdays]) => (
                <section key={tagName}>
                  <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-card/95 backdrop-blur-sm border-b border-border">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {tagName}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectTag(tagBirthdays)}
                        className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                      >
                        Select tag
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClearTag(tagBirthdays)}
                        className="text-xs font-medium text-muted hover:text-foreground transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <ul className="divide-y divide-border">
                    {tagBirthdays.map((birthday) => {
                      const checked = selectedIds.has(birthday._id);
                      return (
                        <li key={birthday._id}>
                          <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent-subtle/40 transition-colors">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelection(birthday._id)}
                              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                            />
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium truncate">
                                {birthday.name}
                              </span>
                              <span className="block text-xs text-muted">
                                {formatBirthdayDate(birthday)}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}

        <div className="mt-5 space-y-3">
          <p className="text-xs text-muted">
            Export download will be enabled in the next update.
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-border/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedCount === 0 || sortedBirthdays.length === 0}
              onClick={handleContinue}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default BirthdaySelectionExport;
