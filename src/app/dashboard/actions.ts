"use server";

import { addSubscription } from "../lib/db";
import { parseBirthdayParts, toBirthdayDate } from "../lib/date.utils";
import { CreateBirthdaySchema } from "../schemas/birthday.schema";
import { revalidatePath } from "next/cache";

export async function submitReminder(formData: FormData) {
  // Read in form data
  const userEmail = formData.get("email") as string;
  const name = (formData.get("name") as string)?.trim();
  const monthRaw = formData.get("month");
  const dayRaw = formData.get("day");
  const yearRaw = formData.get("year");
  const groupId = formData.get("groupId") as string | null;

  if (!name) {
    console.error("Form data is not valid, missing name");
    return;
  }

  let birthdayParts: { month: number; day: number; year?: number };
  try {
    birthdayParts = parseBirthdayParts({
      month: monthRaw as string | null,
      day: dayRaw as string | null,
      year: yearRaw as string | null,
    });
  } catch (error) {
    console.error(
      "Form data is not valid, invalid birthday fields",
      error instanceof Error ? error.message : error,
    );
    return;
  }

  const birthday: {
    name: string;
    month: number;
    day: number;
    year?: number;
    date?: Date;
    groupId?: string;
  } = {
    name,
    month: birthdayParts.month,
    day: birthdayParts.day,
  };

  if (birthdayParts.year !== undefined) {
    birthday.year = birthdayParts.year;
    birthday.date = toBirthdayDate(
      birthdayParts.month,
      birthdayParts.day,
      birthdayParts.year,
    );
  }

  if (groupId) {
    birthday.groupId = groupId;
  }

  const validated = CreateBirthdaySchema.omit({ createdBy: true }).safeParse(
    birthday,
  );

  if (!validated.success) throw new Error("Invalid birthday");
  await addSubscription(userEmail, validated.data, groupId ?? undefined);
  revalidatePath("/dashboard");
}
