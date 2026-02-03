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

export type CreateBirthday = z.infer<typeof CreateBirthdaySchema>;
export type BirthdayDB = z.infer<typeof BirthdayDBSchema>;
