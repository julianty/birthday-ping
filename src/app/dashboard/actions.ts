"use server";

import { addReminder } from "../lib/db";

export async function submitReminder(formData: FormData) {
  const name = formData.get("name") as string;
  const date = formData.get("date") as string;
  console.log(name, date);
  if (!name || !date) {
    console.error("Form data is not valid, name or date not submitted");
    return;
  }
  const reminder = {
    name,
    date,
  };
  const result = await addReminder(reminder);
  console.log(result);
}
