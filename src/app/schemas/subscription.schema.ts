import * as z from "zod";

export const CreateSubscriptionSchema = z.object({
  userId: z.string(),
  birthdayId: z.string(),
});

export const SubscriptionDBSchema = CreateSubscriptionSchema.extend({
  _id: z.string(),
  createdAt: z.date(),
});

export type CreateSubscription = z.infer<typeof CreateSubscriptionSchema>;
export type SubscriptionDB = z.infer<typeof SubscriptionDBSchema>;
