import { ObjectId } from "mongodb";
import * as z from "zod";

export const CreateBirthdaySchema = z.object({
  name: z.string(),
  date: z.date(),
  month: z.int(),
  day: z.int(),
  createdBy: z.instanceof(ObjectId),
});

export const BirthdayDBSchema = CreateBirthdaySchema.extend({
  _id: z.instanceof(ObjectId),
});

export const BirthdayPlainObjectSchema = z.object({
  name: z.string(),
  date: z.date(),
  month: z.int(),
  day: z.int(),
  createdBy: z.string(),
  _id: z.string(),
});
export const UpdateBirthdaySchema = CreateBirthdaySchema.partial();

export type CreateBirthday = z.infer<typeof CreateBirthdaySchema>;
export type BirthdayDB = z.infer<typeof BirthdayDBSchema>;
export type BirthdayPlainObject = z.infer<typeof BirthdayPlainObjectSchema>;

export type UpdateBirthday = z.infer<typeof UpdateBirthdaySchema>;
