import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import React from "react";

interface SubscriptionDisplayProps {
  birthdays: BirthdayPlainObject[];
}

function SubscriptionDisplay({ birthdays }: SubscriptionDisplayProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Your Reminders</h1>
      <ul className="mb-6 text-left">
        {!birthdays ? (
          <li className="text-zinc-500">No reminders yet.</li>
        ) : (
          birthdays.map((birthday) => (
            <li key={birthday._id.toString()} className="mb-2">
              <span className="font-semibold">{birthday.name}</span> —{" "}
              <span>{`${birthday.month}/${birthday.day}/${birthday.date.getFullYear()}`}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default SubscriptionDisplay;
