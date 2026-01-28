import * as z from "zod";

export const UserDBSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.email(),
  image: z.url().nullable().optional(),
  emailVerified: z.boolean().nullable(),
});

export type UserDB = z.infer<typeof UserDBSchema>;
