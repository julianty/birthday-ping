import { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import React from "react";
import BirthdayItem from "./birthday-item";

interface SubscriptionDisplayProps {
  birthdays: BirthdayPlainObject[];
}

function SubscriptionDisplay({ birthdays }: SubscriptionDisplayProps) {
  // Build an ordered map: named groups (sorted A–Z) then ungrouped
  const groupMap = new Map<string | null, BirthdayPlainObject[]>();
  for (const birthday of birthdays) {
    const key = birthday.groupName ?? null;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(birthday);
  }

  const namedGroups = [...groupMap.entries()]
    .filter(([key]) => key !== null)
    .sort(([a], [b]) => a!.localeCompare(b!)) as [
    string,
    BirthdayPlainObject[],
  ][];

  const ungrouped = groupMap.get(null) ?? [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Your Reminders</h1>
      {birthdays.length === 0 ? (
        <p className="text-zinc-500 mb-6">No reminders yet.</p>
      ) : (
        <div className="mb-6 text-left space-y-4">
          {namedGroups.map(([groupName, items]) => (
            <section key={groupName}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 px-2 mb-1 border-b border-zinc-700 pb-1">
                {groupName}
              </h2>
              <ul>
                {items.map((birthday) => (
                  <BirthdayItem key={birthday._id} birthday={birthday} />
                ))}
              </ul>
            </section>
          ))}
          {ungrouped.length > 0 && (
            <section>
              {namedGroups.length > 0 && (
                <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 px-2 mb-1 border-b border-zinc-700 pb-1">
                  Ungrouped
                </h2>
              )}
              <ul>
                {ungrouped.map((birthday) => (
                  <BirthdayItem key={birthday._id} birthday={birthday} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default SubscriptionDisplay;
