import type { BirthdayPlainObject } from "@/app/schemas/birthday.schema";

function parseOptionalInt(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return undefined;
  return Number.parseInt(String(value), 10);
}

function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function normalizeBirthdayDay(month: number, day: number, year: number) {
  if (month === 2 && day === 29 && !isLeapYear(year)) return 28;
  return day;
}

function toLocalBirthdayDate(year: number, month: number, day: number) {
  const safeDay = normalizeBirthdayDay(month, day, year);
  const date = new Date(year, month - 1, safeDay, 0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== safeDay
  ) {
    return null;
  }

  return date;
}

export function getNextBirthdayCountdownTarget(
  birthdays: BirthdayPlainObject[],
  now: Date = new Date(),
): {
  birthday: BirthdayPlainObject;
  targetDate: Date;
  tiedCount: number;
} | null {
  if (birthdays.length === 0) return null;

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );

  let bestBirthday: BirthdayPlainObject | null = null;
  let bestDate: Date | null = null;
  let tiedCount = 0;

  for (const birthday of birthdays) {
    const thisYear = toLocalBirthdayDate(
      todayStart.getFullYear(),
      birthday.month,
      birthday.day,
    );
    const nextYear = toLocalBirthdayDate(
      todayStart.getFullYear() + 1,
      birthday.month,
      birthday.day,
    );

    if (!thisYear || !nextYear) continue;

    const candidate = thisYear >= todayStart ? thisYear : nextYear;

    if (!bestDate || candidate < bestDate) {
      bestDate = candidate;
      bestBirthday = birthday;
      tiedCount = 1;
      continue;
    }

    if (candidate.getTime() === bestDate.getTime()) {
      tiedCount += 1;
    }
  }

  if (!bestBirthday || !bestDate) return null;

  return {
    birthday: bestBirthday,
    targetDate: bestDate,
    tiedCount,
  };
}

export function isValidBirthdayParts(
  month: number,
  day: number,
  year?: number,
): boolean {
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(day) || day < 1) return false;

  const effectiveYear = year ?? 2000; // leap-safe default for yearless birthdays
  const maxDay = new Date(Date.UTC(effectiveYear, month, 0)).getUTCDate();
  return day <= maxDay;
}

export function parseBirthdayParts(input: {
  month: string | number | null | undefined;
  day: string | number | null | undefined;
  year?: string | number | null | undefined;
}): { month: number; day: number; year?: number } {
  const month = parseOptionalInt(input.month);
  const day = parseOptionalInt(input.day);
  const year = parseOptionalInt(input.year);

  if (month === undefined || day === undefined) {
    throw new Error("Month and day are required");
  }

  if (!isValidBirthdayParts(month, day, year)) {
    throw new Error("Invalid birthday");
  }

  if (year === undefined) return { month, day };
  return { month, day, year };
}

export function toBirthdayDate(
  month: number,
  day: number,
  year?: number,
): Date | undefined {
  if (year === undefined) return undefined;
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatBirthdayLabel(
  month: number,
  day: number,
  year?: number,
): string {
  return year ? `${month}/${day}/${year}` : `${month}/${day}`;
}

export function getMonthFromDateString(inputString: string) {
  return Number.parseInt(inputString.split("-")[1], 10);
}

export function getDayFromDateString(inputString: string) {
  return Number.parseInt(inputString.split("-")[2], 10);
}
