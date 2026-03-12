import { ObjectId } from "mongodb";
import * as z from "zod";

export const CreateBirthdaySchema = z.object({
  name: z.string(),
  date: z.date().optional(),
  month: z.int().min(1).max(12),
  day: z.int().min(1).max(31),
  year: z.int().min(1).max(9999).optional(),
  createdBy: z.instanceof(ObjectId),
});

export const BirthdayDBSchema = CreateBirthdaySchema.extend({
  _id: z.instanceof(ObjectId),
});

export const BirthdayPlainObjectSchema = z.object({
  name: z.string(),
  date: z.date().optional(),
  month: z.int().min(1).max(12),
  day: z.int().min(1).max(31),
  year: z.int().min(1).max(9999).optional(),
  createdBy: z.string(),
  _id: z.string(),
  groupId: z.string().optional(),
  groupName: z.string().optional(),
});
export const UpdateBirthdaySchema = CreateBirthdaySchema.partial();

export type CreateBirthday = z.infer<typeof CreateBirthdaySchema>;
export type BirthdayDB = z.infer<typeof BirthdayDBSchema>;
export type BirthdayPlainObject = z.infer<typeof BirthdayPlainObjectSchema>;

export type UpdateBirthday = z.infer<typeof UpdateBirthdaySchema>;
