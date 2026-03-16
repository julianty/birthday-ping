import * as z from "zod";

export const ImportConfidenceSchema = z.enum(["high", "medium", "low"]);

export const ImportedBirthdayCandidateSchema = z.object({
  tempId: z.string().min(1),
  uid: z.string().optional(),
  summary: z.string().min(1),
  rawName: z.string().min(1),
  normalizedName: z.string().min(1),
  month: z.int().min(1).max(12),
  day: z.int().min(1).max(31),
  year: z.int().min(1).max(9999).optional(),
  confidence: ImportConfidenceSchema,
  score: z.int().min(0),
  warnings: z.array(z.string()),
  categories: z.array(z.string()),
  description: z.string().optional(),
  source: z.object({
    recurrence: z.string().optional(),
    dtstart: z.string(),
  }),
});

export const ImportPreviewBodySchema = z.object({
  icsContent: z.string().min(1).max(500_000),
  fileName: z.string().max(255).optional(),
});

export const ImportPreviewResponseSchema = z.object({
  candidates: z.array(ImportedBirthdayCandidateSchema),
  filteredOutCount: z.int().min(0),
  totalEventCount: z.int().min(0),
  warnings: z.array(z.string()),
});

export const ImportSelectionSchema = z.object({
  tempId: z.string().min(1),
  normalizedName: z.string().trim().min(1),
  month: z.int().min(1).max(12),
  day: z.int().min(1).max(31),
  year: z.int().min(1).max(9999).optional(),
  groupId: z.string().min(1).optional(),
});

export const ImportBirthdaysBodySchema = z.object({
  selections: z.array(ImportSelectionSchema).min(1),
});

export type ImportedBirthdayCandidate = z.infer<
  typeof ImportedBirthdayCandidateSchema
>;
export type ImportPreviewBody = z.infer<typeof ImportPreviewBodySchema>;
export type ImportPreviewResponse = z.infer<typeof ImportPreviewResponseSchema>;
export type ImportSelection = z.infer<typeof ImportSelectionSchema>;
