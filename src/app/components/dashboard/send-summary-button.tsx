"use client";
import { sendReminderEmail } from "@/app/lib/email";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import React from "react";

interface SendSummaryButtonProps {
  birthdays: BirthdayPlainObject[];
}

function SendSummaryButton({ birthdays }: SendSummaryButtonProps) {
  return (
    <button
      className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      onClick={() => sendReminderEmail(birthdays)}
    >
      Send Reminders Summary
    </button>
  );
}

export default SendSummaryButton;
