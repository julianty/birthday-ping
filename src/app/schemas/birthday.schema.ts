import * as z from "zod";

export const CreateBirthdaySchema = z.object({
  name: z.string(),
  date: z.date(),
  month: z.int(),
  day: z.int(),
});

export type CreateBirthday = z.infer<typeof CreateBirthdaySchema>;
