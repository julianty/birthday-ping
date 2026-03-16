"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { GroupOption } from "./group-select";
import type { ImportedBirthdayCandidate } from "@/app/schemas/import.schema";

interface BirthdaySelectionImportProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewFile: (file: File) => Promise<void>;
  onImport: (
    selections: Array<{
      tempId: string;
      normalizedName: string;
      month: number;
      day: number;
      year?: number;
      groupId?: string;
    }>,
  ) => Promise<void>;
  candidates: ImportedBirthdayCandidate[];
  groups: GroupOption[];
  previewWarnings: string[];
  filteredOutCount: number;
  totalEventCount: number;
  isPreviewing: boolean;
  isImporting: boolean;
  errorMessage: string | null;
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

type DraftRow = {
  normalizedName: string;
  groupId: string;
};

function formatBirthdayDate(candidate: ImportedBirthdayCandidate) {
  const monthLabel =
    MONTH_SHORT[candidate.month - 1] ?? String(candidate.month);
  return `${monthLabel} ${candidate.day}${candidate.year ? `, ${candidate.year}` : ""}`;
}

function confidenceRank(confidence: ImportedBirthdayCandidate["confidence"]) {
  switch (confidence) {
    case "high":
      return 0;
    case "medium":
      return 1;
    default:
      return 2;
  }
}

function confidenceLabel(confidence: ImportedBirthdayCandidate["confidence"]) {
  switch (confidence) {
    case "high":
      return "High confidence";
    case "medium":
      return "Needs review";
    default:
      return "Low confidence";
  }
}

function BirthdaySelectionImport({
  isOpen,
  onClose,
  onPreviewFile,
  onImport,
  candidates,
  groups,
  previewWarnings,
  filteredOutCount,
  totalEventCount,
  isPreviewing,
  isImporting,
  errorMessage,
}: BirthdaySelectionImportProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(candidates.map((candidate) => candidate.tempId)),
  );
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>(() =>
    Object.fromEntries(
      candidates.map((candidate) => [
        candidate.tempId,
        {
          normalizedName: candidate.normalizedName,
          groupId: "",
        },
      ]),
    ),
  );

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      const rankDiff =
        confidenceRank(a.confidence) - confidenceRank(b.confidence);
      if (rankDiff !== 0) return rankDiff;
      if (a.month !== b.month) return a.month - b.month;
      if (a.day !== b.day) return a.day - b.day;
      return a.normalizedName.localeCompare(b.normalizedName);
    });
  }, [candidates]);

  const groupedCandidates = useMemo(() => {
    const grouped = new Map<string, ImportedBirthdayCandidate[]>();
    for (const candidate of sortedCandidates) {
      const key = confidenceLabel(candidate.confidence);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(candidate);
    }
    return [...grouped.entries()];
  }, [sortedCandidates]);

  const selectedCount = selectedIds.size;

  function handleClose() {
    if (isPreviewing || isImporting) return;
    onClose();
  }

  function toggleSelection(tempId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tempId)) {
        next.delete(tempId);
      } else {
        next.add(tempId);
      }
      return next;
    });
  }

  function handleSelectAll() {
    setSelectedIds(
      new Set(sortedCandidates.map((candidate) => candidate.tempId)),
    );
  }

  function handleClear() {
    setSelectedIds(new Set());
  }

  function handleSelectGroup(groupCandidates: ImportedBirthdayCandidate[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const candidate of groupCandidates) next.add(candidate.tempId);
      return next;
    });
  }

  function handleClearGroup(groupCandidates: ImportedBirthdayCandidate[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const candidate of groupCandidates) next.delete(candidate.tempId);
      return next;
    });
  }

  function updateDraft(tempId: string, patch: Partial<DraftRow>) {
    setDrafts((prev) => ({
      ...prev,
      [tempId]: {
        ...(prev[tempId] ?? { normalizedName: "", groupId: "" }),
        ...patch,
      },
    }));
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await onPreviewFile(file);
    event.target.value = "";
  }

  async function handleImport() {
    const selections = sortedCandidates
      .filter((candidate) => selectedIds.has(candidate.tempId))
      .map((candidate) => {
        const draft = drafts[candidate.tempId];
        return {
          tempId: candidate.tempId,
          normalizedName: (
            draft?.normalizedName ?? candidate.normalizedName
          ).trim(),
          month: candidate.month,
          day: candidate.day,
          ...(typeof candidate.year === "number"
            ? { year: candidate.year }
            : {}),
          ...(draft?.groupId ? { groupId: draft.groupId } : {}),
        };
      })
      .filter((selection) => selection.normalizedName.length > 0);

    if (selections.length === 0) return;
    await onImport(selections);
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full sm:max-w-3xl bg-card rounded-t-2xl sm:rounded-2xl shadow-xl p-6 animate-slide-up"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5 gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Import Birthdays from .ics
            </h2>
            <p className="text-sm text-muted">
              Upload a calendar file, review the birthday-like events, then
              choose what to import.
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

        <div className="space-y-4">
          <label className="block rounded-xl border border-dashed border-border bg-background px-4 py-4 cursor-pointer hover:bg-accent-subtle/30 transition-colors">
            <span className="block text-sm font-medium">
              Choose an .ics file
            </span>
            <span className="block mt-1 text-xs text-muted">
              The file is parsed on the server. Only birthday-like events are
              shown for selection.
            </span>
            <input
              type="file"
              accept=".ics,text/calendar"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isPreviewing || isImporting}
            />
          </label>

          {(previewWarnings.length > 0 || totalEventCount > 0) && (
            <div className="rounded-xl border border-border bg-background px-4 py-3 space-y-1">
              <p className="text-sm font-medium">
                {candidates.length} candidates from {totalEventCount} calendar
                events
              </p>
              {filteredOutCount > 0 && (
                <p className="text-xs text-muted">
                  Ignored {filteredOutCount} event
                  {filteredOutCount === 1 ? "" : "s"} that did not look like
                  birthdays.
                </p>
              )}
              {previewWarnings.map((warning) => (
                <p key={warning} className="text-xs text-muted">
                  {warning}
                </p>
              ))}
            </div>
          )}

          {sortedCandidates.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-1">
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

              <div className="max-h-112 overflow-y-auto rounded-xl border border-border divide-y divide-border bg-background">
                {groupedCandidates.map(([groupName, groupCandidates]) => (
                  <section key={groupName}>
                    <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-card/95 backdrop-blur-sm border-b border-border">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        {groupName}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectGroup(groupCandidates)}
                          className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                        >
                          Select group
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearGroup(groupCandidates)}
                          className="text-xs font-medium text-muted hover:text-foreground transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <ul className="divide-y divide-border">
                      {groupCandidates.map((candidate) => {
                        const checked = selectedIds.has(candidate.tempId);
                        const draft = drafts[candidate.tempId] ?? {
                          normalizedName: candidate.normalizedName,
                          groupId: "",
                        };

                        return (
                          <li
                            key={candidate.tempId}
                            className="px-3 py-3 space-y-2"
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  toggleSelection(candidate.tempId)
                                }
                                className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
                              />

                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs rounded-full bg-accent-subtle px-2 py-1 text-accent font-medium">
                                    {formatBirthdayDate(candidate)}
                                  </span>
                                  <span className="text-xs rounded-full border border-border px-2 py-1 text-muted">
                                    {candidate.confidence}
                                  </span>
                                </div>

                                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
                                  <input
                                    type="text"
                                    value={draft.normalizedName}
                                    onChange={(event) =>
                                      updateDraft(candidate.tempId, {
                                        normalizedName: event.target.value,
                                      })
                                    }
                                    disabled={!checked || isImporting}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm"
                                  />

                                  <select
                                    value={draft.groupId}
                                    onChange={(event) =>
                                      updateDraft(candidate.tempId, {
                                        groupId: event.target.value,
                                      })
                                    }
                                    disabled={!checked || isImporting}
                                    className="w-full rounded-lg border border-border bg-card text-foreground px-3 py-2 text-sm"
                                  >
                                    <option value="">No group</option>
                                    {groups.map((group) => (
                                      <option key={group._id} value={group._id}>
                                        {group.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <p className="text-xs text-muted">
                                  Source summary: {candidate.summary}
                                </p>
                                {candidate.warnings.map((warning) => (
                                  <p
                                    key={`${candidate.tempId}-${warning}`}
                                    className="text-xs text-amber-700"
                                  >
                                    {warning}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}

          {sortedCandidates.length === 0 &&
            totalEventCount > 0 &&
            !isPreviewing && (
              <div className="rounded-xl border border-border bg-background px-4 py-6 text-center">
                <p className="text-sm text-muted">
                  No birthday-like events were found in this calendar file.
                </p>
              </div>
            )}

          {errorMessage && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPreviewing || isImporting}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-border/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={selectedCount === 0 || isPreviewing || isImporting}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {isImporting ? "Importing..." : "Import selected"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default BirthdaySelectionImport;
