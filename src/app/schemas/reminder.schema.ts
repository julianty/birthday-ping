import * as z from "zod";

export const CreateReminderSchema = z.object({
  name: z.string(),
  date: z.date(),
});

export const UpdateReminderSchema = CreateReminderSchema.partial();

export const ReminderDBSchema = CreateReminderSchema.extend({
  _id: z.string(),
});
