"use client";
import { useState } from "react";
import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import SubscriptionDisplay from "./subscription-display";
import AddReminderForm from "./add-reminder-form";

interface DashboardContentProps {
  birthdays: BirthdayPlainObject[];
  birthdayCount: number;
}

export default function DashboardContent({
  birthdays,
  birthdayCount,
}: DashboardContentProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  return (
    <>
      <SubscriptionDisplay
        birthdays={birthdays}
        onSelectionModeChange={setIsSelectionMode}
      />
      <AddReminderForm
        key={`v=${birthdayCount}`}
        isSelectionMode={isSelectionMode}
      />
    </>
  );
}
