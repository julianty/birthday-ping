import { ObjectId } from "mongodb";
import * as z from "zod";

export const CreateSubscriptionSchema = z.object({
  userId: z.instanceof(ObjectId),
  birthdayId: z.instanceof(ObjectId),
});

export const SubscriptionDBSchema = CreateSubscriptionSchema.extend({
  _id: z.instanceof(ObjectId),
  createdAt: z.date(),
});

export type CreateSubscription = z.infer<typeof CreateSubscriptionSchema>;
export type SubscriptionDB = z.infer<typeof SubscriptionDBSchema>;
