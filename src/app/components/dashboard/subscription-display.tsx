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

  if (birthdays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <span className="text-3xl">🎂</span>
        </div>
        <h2 className="text-lg font-semibold mb-1">No birthdays yet</h2>
        <p className="text-muted text-sm">
          Tap the + button to add your first reminder.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Birthdays</h1>
        <span className="text-sm text-muted">{birthdays.length} total</span>
      </div>

      {namedGroups.map(([groupName, items]) => (
        <section key={groupName}>
          <h2 className="sticky top-14 z-10 text-xs font-semibold uppercase tracking-widest text-muted px-3 py-2 bg-background/90 backdrop-blur-sm border-b border-border mb-1">
            {groupName}
          </h2>
          <ul className="space-y-1">
            {items.map((birthday) => (
              <BirthdayItem key={birthday._id} birthday={birthday} />
            ))}
          </ul>
        </section>
      ))}

      {ungrouped.length > 0 && (
        <section>
          {namedGroups.length > 0 && (
            <h2 className="sticky top-14 z-10 text-xs font-semibold uppercase tracking-widest text-muted px-3 py-2 bg-background/90 backdrop-blur-sm border-b border-border mb-1">
              Ungrouped
            </h2>
          )}
          <ul className="space-y-1">
            {ungrouped.map((birthday) => (
              <BirthdayItem key={birthday._id} birthday={birthday} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default SubscriptionDisplay;
