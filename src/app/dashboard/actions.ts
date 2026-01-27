"use server";

import { addReminder } from "../lib/db";
import { CreateReminderSchema } from "@/app/schemas/reminder.schema";
import * as z from "zod";
import {
  getDayFromDateString,
  getMonthFromDateString,
} from "../lib/date.utils";

export async function submitReminder(formData: FormData) {
  const name = formData.get("name") as string;
  const date = formData.get("date") as string;
  if (!name || !date) {
    console.error("Form data is not valid, name or date not submitted");
    return;
  }
  const month = getMonthFromDateString(date) as number;
  const day = getDayFromDateString(date) as number;

  const reminder = {
    name,
    date,
    month,
    day,
  };

  const validatedReminder = z.parse(CreateReminderSchema, reminder);
  const result = await addReminder(validatedReminder);
  console.log(result);
}
