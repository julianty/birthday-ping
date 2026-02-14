"use server";

import { addSubscription } from "../lib/db";
import * as z from "zod";
import { CreateBirthdaySchema } from "../schemas/birthday.schema";
import { revalidatePath } from "next/cache";

export async function submitReminder(formData: FormData) {
  // Read in form data
  const userEmail = formData.get("email") as string;
  const name = formData.get("name") as string;
  const date = z.coerce.date().parse(formData.get("date"));
  if (!name || !date) {
    console.error("Form data is not valid, name or date not submitted");
    return;
  }
  const dateString = formData.get("date") as string;
  const month = Number(dateString.split("-")[1]);
  const day = Number(dateString.split("-")[2]);

  const birthday = {
    name,
    date,
    month,
    day,
  };

  const validated = CreateBirthdaySchema.omit({ createdBy: true }).safeParse(
    birthday,
  );

  if (!validated.success) throw new Error("Invalid birthday");
  await addSubscription(userEmail, validated.data);
  revalidatePath("/dashboard");
}
