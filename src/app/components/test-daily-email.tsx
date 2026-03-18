"use client";
import React from "react";
import { sendDailyEmail } from "../lib/email";
import { useTransition } from "react";

type TestDailyEmailButtonProps = {
  userEmail: string;
};

function TestDailyEmailButton({ userEmail }: TestDailyEmailButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => void sendDailyEmail(userEmail))}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60"
    >
      {isPending ? "Sending Daily Test..." : "Send Daily Test Email"}
    </button>
  );
}

export default TestDailyEmailButton;
