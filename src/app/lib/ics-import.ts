import "server-only";
import { createRequire } from "module";
import type { VEvent } from "node-ical";
import {
  ImportedBirthdayCandidate,
  ImportedBirthdayCandidateSchema,
} from "@/app/schemas/import.schema";
import { isValidBirthdayParts } from "@/app/lib/date.utils";

const require = createRequire(import.meta.url);
const ical = require("node-ical") as typeof import("node-ical");

export type ParsedImportPreview = {
  candidates: ImportedBirthdayCandidate[];
  filteredOutCount: number;
  totalEventCount: number;
  warnings: string[];
};

function resolveSummary(summary: VEvent["summary"]): string {
  if (!summary) return "";
  if (typeof summary === "string") return summary.trim();
  if (typeof summary === "object" && "val" in summary) {
    return String((summary as { val: unknown }).val).trim();
  }
  return String(summary).trim();
}

function resolveDescription(description: VEvent["description"]): string {
  if (!description) return "";
  if (typeof description === "string") return description.trim();
  if (typeof description === "object" && "val" in description) {
    return String((description as { val: unknown }).val).trim();
  }
  return String(description).trim();
}

function parseDateFromEvent(event: VEvent) {
  const start = event.start;
  if (!start) return null;

  const year = start.getUTCFullYear();
  const month = start.getUTCMonth() + 1;
  const day = start.getUTCDate();

  if (!isValidBirthdayParts(month, day, year)) return null;

  return { year, month, day };
}

function resolveBirthYear(event: VEvent, fallbackYear: number) {
  const metadataHasYear = (event as Record<string, unknown>)[
    "BIRTHDAYPING-HAS-BIRTH-YEAR"
  ];
  const metadataYear = (event as Record<string, unknown>)[
    "BIRTHDAYPING-BIRTH-YEAR"
  ];

  if (metadataHasYear === "0" || metadataHasYear === 0) {
    return undefined;
  }

  if (typeof metadataYear === "string") {
    const parsed = Number.parseInt(metadataYear, 10);
    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 9999) {
      return parsed;
    }
  }

  return fallbackYear;
}

function normalizeBirthdayName(summary: string) {
  const trimmed = summary.trim();
  const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
    [/^(.+?)'s birthday$/i, (match) => match[1]],
    [/^birthday:?\s+(.+)$/i, (match) => match[1]],
    [/^birthday of\s+(.+)$/i, (match) => match[1]],
    [/^(.+?) birthday$/i, (match) => match[1]],
  ];

  for (const [pattern, project] of patterns) {
    const match = trimmed.match(pattern);
    if (!match) continue;
    const candidate = project(match).trim();
    if (candidate) {
      return {
        rawName: trimmed,
        normalizedName: candidate,
        confidenceBoost: 2,
      };
    }
  }

  return { rawName: trimmed, normalizedName: trimmed, confidenceBoost: 0 };
}

function includesBirthdayKeyword(value?: string) {
  return value ? /\bbirthday\b/i.test(value) : false;
}

function isYearlyRecurring(event: VEvent) {
  if (!event.rrule) return false;
  const ruleText = event.rrule.toString().toUpperCase();
  return ruleText.includes("FREQ=YEARLY");
}

function scoreEvent(event: VEvent, summary: string, description: string) {
  let score = 0;
  const warnings: string[] = [];
  const categories = (event.categories ?? []).map((c) => c.toLowerCase());

  if (isYearlyRecurring(event)) score += 2;
  if (categories.some((c) => c.includes("birthday"))) score += 3;
  if (includesBirthdayKeyword(summary)) score += 2;
  if (includesBirthdayKeyword(description)) score += 1;
  if (event.uid?.startsWith("birthday-")) score += 2;

  if (!isYearlyRecurring(event)) {
    warnings.push("Event is not marked as yearly recurring.");
  }

  return { score, warnings };
}

function toConfidence(score: number): ImportedBirthdayCandidate["confidence"] {
  if (score >= 5) return "high";
  if (score >= 3) return "medium";
  return "low";
}

export function parseBirthdayIcsImport(
  icsContent: string,
): ParsedImportPreview {
  const parsed = ical.parseICS(icsContent);
  const events = Object.values(parsed).filter(
    (component): component is VEvent => component?.type === "VEVENT",
  );

  const warnings: string[] = [];
  const candidates: ImportedBirthdayCandidate[] = [];
  let filteredOutCount = 0;

  events.forEach((event, index) => {
    const summary = resolveSummary(event.summary);
    if (!summary) {
      filteredOutCount += 1;
      warnings.push(`Skipped event ${index + 1}: missing summary.`);
      return;
    }

    const parsedDate = parseDateFromEvent(event);
    if (!parsedDate) {
      filteredOutCount += 1;
      warnings.push(
        `Skipped event ${index + 1}: unsupported or missing DTSTART.`,
      );
      return;
    }

    const description = resolveDescription(event.description);
    const { score, warnings: eventWarnings } = scoreEvent(
      event,
      summary,
      description,
    );
    const nameInfo = normalizeBirthdayName(summary);
    const totalScore = score + nameInfo.confidenceBoost;

    const isBirthdayLike =
      includesBirthdayKeyword(summary) ||
      includesBirthdayKeyword(description) ||
      (event.categories ?? []).some((c) => /birthday/i.test(c)) ||
      totalScore >= 4;

    if (!isBirthdayLike) {
      filteredOutCount += 1;
      return;
    }

    if (nameInfo.confidenceBoost === 0) {
      eventWarnings.push(
        "Name could not be cleanly extracted; review before import.",
      );
    }

    const candidate = ImportedBirthdayCandidateSchema.parse({
      tempId: event.uid || `event-${index + 1}`,
      uid: event.uid,
      summary,
      rawName: nameInfo.rawName,
      normalizedName: nameInfo.normalizedName,
      month: parsedDate.month,
      day: parsedDate.day,
      year: resolveBirthYear(event, parsedDate.year),
      confidence: toConfidence(totalScore),
      score: totalScore,
      warnings: eventWarnings,
      categories: event.categories ?? [],
      description: description || undefined,
      source: {
        recurrence: event.rrule?.toString(),
        dtstart: event.start.toISOString(),
      },
    });

    candidates.push(candidate);
  });

  return {
    candidates,
    filteredOutCount,
    totalEventCount: events.length,
    warnings,
  };
}
