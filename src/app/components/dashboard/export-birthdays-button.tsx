"use client";

import { useState } from "react";
import type { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import BirthdaySelectionExport from "./birthday-selection-export";

interface ExportBirthdaysButtonProps {
  birthdays: BirthdayPlainObject[];
}

function ExportBirthdaysButton({ birthdays }: ExportBirthdaysButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleContinue(selectedIds: string[]) {
    if (selectedIds.length === 0) return;

    setIsExporting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/birthdays/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthdayIds: selectedIds }),
      });

      if (!response.ok) {
        let errorText = "Failed to export birthdays";
        try {
          const payload = (await response.json()) as { error?: string };
          if (payload?.error) errorText = payload.error;
        } catch {
          // Leave default message for non-JSON responses.
        }
        throw new Error(errorText);
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      const filenameMatch = contentDisposition?.match(/filename="?([^";]+)"?/i);
      const filename = filenameMatch?.[1] ?? "birthdays.ics";

      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);

      setIsOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to export birthdays";
      setErrorMessage(message);
    } finally {
      setIsExporting(false);
    }
  }

  function handleOpen() {
    setErrorMessage(null);
    setIsOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-border/40 transition-colors"
      >
        Export Birthdays
      </button>

      <BirthdaySelectionExport
        birthdays={birthdays}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onContinue={handleContinue}
        isExporting={isExporting}
        errorMessage={errorMessage}
      />
    </>
  );
}

export default ExportBirthdaysButton;
