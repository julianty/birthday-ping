"use client";

import { useEffect, useMemo, useState } from "react";
import type { BirthdayPlainObject } from "@/app/schemas/birthday.schema";
import { getNextBirthdayCountdownTarget } from "@/app/lib/date.utils";

interface NextBirthdayCountdownProps {
  birthdays: BirthdayPlainObject[];
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatUnit(value: number) {
  return String(value).padStart(2, "0");
}

function NextBirthdayCountdown({ birthdays }: NextBirthdayCountdownProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const nextBirthday = useMemo(
    () => getNextBirthdayCountdownTarget(birthdays, now),
    [birthdays, now],
  );

  if (!nextBirthday) {
    return (
      <section className="mb-6 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm text-muted">
          Add a birthday to start your countdown.
        </p>
      </section>
    );
  }

  const remainingMs = Math.max(
    0,
    nextBirthday.targetDate.getTime() - now.getTime(),
  );
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const monthLabel = MONTH_SHORT[nextBirthday.birthday.month - 1] ?? "";
  const birthdayLabel = `${monthLabel} ${nextBirthday.birthday.day}`;
  const isToday = remainingMs === 0;

  return (
    <section className="mb-6 rounded-2xl border border-success-border bg-success-subtle p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-success">
        Next Birthday
      </p>
      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-foreground">
            {nextBirthday.birthday.name}
          </p>
          <p className="text-sm text-muted">
            {birthdayLabel}
            {nextBirthday.tiedCount > 1
              ? ` (+${nextBirthday.tiedCount - 1} more)`
              : ""}
          </p>
        </div>
        <p className="font-mono text-base font-semibold text-success sm:text-lg">
          {isToday
            ? "Today"
            : `${days}d ${formatUnit(hours)}h ${formatUnit(minutes)}m ${formatUnit(seconds)}s`}
        </p>
      </div>
    </section>
  );
}

export default NextBirthdayCountdown;
