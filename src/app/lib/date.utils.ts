function parseOptionalInt(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return undefined;
  return Number.parseInt(String(value), 10);
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
