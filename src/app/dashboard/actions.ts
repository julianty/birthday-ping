"use server";

import { addReminder, addSubscription } from "../lib/db";
import * as z from "zod";
import {
  getDayFromDateString,
  getMonthFromDateString,
} from "../lib/date.utils";
import { CreateBirthdaySchema } from "../schemas/birthday.schema";

export async function submitReminder(formData: FormData) {
  // Read in form data
  const userEmail = formData.get("email") as string;
  const name = formData.get("name") as string;
  const date = formData.get("date") as string;
  if (!name || !date) {
    console.error("Form data is not valid, name or date not submitted");
    return;
  }
  const month = getMonthFromDateString(date) as number;
  const day = getDayFromDateString(date) as number;

  const birthday = {
    name,
    date,
    month,
    day,
  };

  const validatedBirthday = z.parse(CreateBirthdaySchema, birthday);
  const result = await addSubscription(userEmail, validatedBirthday);
  console.log(result);
}
