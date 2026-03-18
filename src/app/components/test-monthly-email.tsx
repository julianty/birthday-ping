"use client";
import React from "react";
import { useTransition } from "react";
import { sendMonthlyEmail } from "../lib/email";

function TestMonthlyEmailButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => void sendMonthlyEmail())}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60"
    >
      {isPending ? "Sending Monthly Test..." : "Send Monthly Test Email"}
    </button>
  );
}

export default TestMonthlyEmailButton;
