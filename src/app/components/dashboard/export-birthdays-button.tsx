"use client";

import { useState } from "react";
import type { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import BirthdaySelectionExport from "./birthday-selection-export";

interface ExportBirthdaysButtonProps {
  birthdays: BirthdayPlainObject[];
}

function ExportBirthdaysButton({ birthdays }: ExportBirthdaysButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-border/40 transition-colors"
      >
        Export Birthdays
      </button>

      <BirthdaySelectionExport
        birthdays={birthdays}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onContinue={() => setIsOpen(false)}
      />
    </>
  );
}

export default ExportBirthdaysButton;
