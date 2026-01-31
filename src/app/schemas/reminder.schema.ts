import { ObjectId } from "mongodb";
import * as z from "zod";

export const CreateReminderSchema = z.object({
  name: z.string(),
  date: z.coerce.date(),
  month: z.int(),
  day: z.int(),
});

export const UpdateReminderSchema = CreateReminderSchema.partial();

export const ReminderDBSchema = CreateReminderSchema.extend({
  _id: z.instanceof(ObjectId),
});

export type CreateReminder = z.infer<typeof CreateReminderSchema>;
export type UpdateReminder = z.infer<typeof UpdateReminderSchema>;
export type ReminderDB = z.infer<typeof ReminderDBSchema>;
