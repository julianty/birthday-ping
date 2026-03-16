"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BirthdaySelectionImport from "./birthday-selection-import";
import type { GroupOption } from "./group-select";
import type { ImportPreviewResponse } from "@/app/schemas/import.schema";

function ImportBirthdaysButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [candidates, setCandidates] = useState<
    ImportPreviewResponse["candidates"]
  >([]);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [filteredOutCount, setFilteredOutCount] = useState(0);
  const [totalEventCount, setTotalEventCount] = useState(0);

  async function loadGroups() {
    try {
      const response = await fetch("/api/groups");
      if (!response.ok) return;
      const payload = (await response.json()) as GroupOption[];
      setGroups(payload);
    } catch (error) {
      console.error("Failed to load groups for import:", error);
    }
  }

  async function handleOpen() {
    setErrorMessage(null);
    setIsOpen(true);
    if (groups.length === 0) {
      await loadGroups();
    }
  }

  function handleClose() {
    if (isPreviewing || isImporting) return;
    setIsOpen(false);
    setCandidates([]);
    setPreviewWarnings([]);
    setFilteredOutCount(0);
    setTotalEventCount(0);
    setErrorMessage(null);
  }

  async function handlePreviewFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".ics")) {
      setErrorMessage("Please choose an .ics file.");
      return;
    }

    setIsPreviewing(true);
    setErrorMessage(null);

    try {
      const icsContent = await file.text();
      const response = await fetch("/api/birthdays/import/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          icsContent,
        }),
      });

      if (!response.ok) {
        let message = "Failed to parse calendar file";
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) message = payload.error;
        } catch {
          // Ignore JSON parse failure.
        }
        throw new Error(message);
      }

      const payload = (await response.json()) as ImportPreviewResponse;
      setCandidates(payload.candidates);
      setPreviewWarnings(payload.warnings);
      setFilteredOutCount(payload.filteredOutCount);
      setTotalEventCount(payload.totalEventCount);
    } catch (error) {
      setCandidates([]);
      setPreviewWarnings([]);
      setFilteredOutCount(0);
      setTotalEventCount(0);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to parse calendar file",
      );
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleImport(
    selections: Array<{
      tempId: string;
      normalizedName: string;
      month: number;
      day: number;
      year?: number;
      groupId?: string;
    }>,
  ) {
    setIsImporting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/birthdays/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections }),
      });

      if (!response.ok) {
        let message = "Failed to import birthdays";
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) message = payload.error;
        } catch {
          // Ignore JSON parse failure.
        }
        throw new Error(message);
      }

      handleClose();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to import birthdays",
      );
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-border/40 transition-colors"
      >
        Import Birthdays
      </button>

      <BirthdaySelectionImport
        key={`${isOpen}-${candidates.map((candidate) => candidate.tempId).join("|")}`}
        isOpen={isOpen}
        onClose={handleClose}
        onPreviewFile={handlePreviewFile}
        onImport={handleImport}
        candidates={candidates}
        groups={groups}
        previewWarnings={previewWarnings}
        filteredOutCount={filteredOutCount}
        totalEventCount={totalEventCount}
        isPreviewing={isPreviewing}
        isImporting={isImporting}
        errorMessage={errorMessage}
      />
    </>
  );
}

export default ImportBirthdaysButton;
