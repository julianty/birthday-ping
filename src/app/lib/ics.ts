import type { BirthdayPlainObject } from "@/app/schemas/birthday.schema";

const NO_YEAR_REFERENCE = 2000;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function normalizeBirthdayDay(month: number, day: number, year: number) {
  if (month === 2 && day === 29 && !isLeapYear(year)) return 28;
  return day;
}

function formatDateValue(year: number, month: number, day: number) {
  return `${year}${pad(month)}${pad(day)}`;
}

function formatDateValueWithoutYear(month: number, day: number) {
  return `--${pad(month)}${pad(day)}`;
}

function formatUtcDateTime(value: Date) {
  return (
    [
      value.getUTCFullYear(),
      pad(value.getUTCMonth() + 1),
      pad(value.getUTCDate()),
    ].join("") +
    "T" +
    [
      pad(value.getUTCHours()),
      pad(value.getUTCMinutes()),
      pad(value.getUTCSeconds()),
    ].join("") +
    "Z"
  );
}

function escapeICalText(input: string) {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function generateBirthdayIcs(
  birthdays: BirthdayPlainObject[],
  now: Date = new Date(),
) {
  const dtstamp = formatUtcDateTime(now);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Birthday Ping//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const birthday of birthdays) {
    const hasBirthYear = typeof birthday.year === "number";
    const eventYear = birthday.year ?? NO_YEAR_REFERENCE;
    const eventDay = normalizeBirthdayDay(
      birthday.month,
      birthday.day,
      eventYear,
    );
    const summary = escapeICalText(`${birthday.name}'s Birthday`);

    lines.push(
      "BEGIN:VEVENT",
      `UID:birthday-${birthday._id}@birthday-ping.local`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${formatDateValue(eventYear, birthday.month, eventDay)}`,
      `X-BIRTHDAYPING-HAS-BIRTH-YEAR:${hasBirthYear ? "1" : "0"}`,
      ...(hasBirthYear
        ? [`X-BIRTHDAYPING-BIRTH-YEAR:${birthday.year}`]
        : [
            `X-APPLE-OMIT-YEAR:${formatDateValueWithoutYear(
              birthday.month,
              birthday.day,
            )}`,
          ]),
      `SUMMARY:${summary}`,
      "RRULE:FREQ=YEARLY",
      "STATUS:CONFIRMED",
      "TRANSP:TRANSPARENT",
      "CATEGORIES:Birthday",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return `${lines.join("\r\n")}\r\n`;
}
