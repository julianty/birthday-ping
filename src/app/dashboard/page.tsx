import AddReminderForm from "@/app/components/dashboard/add-reminder-form";
import { getReminders, BirthdayWithGroup } from "@/app/lib/db";
import SignOutButton from "../components/sign-out-button";
import { auth } from "../auth";
import SubscriptionDisplay from "../components/dashboard/subscription-display";
import { BirthdayPlainObject } from "../schemas/birthday.schema";
import SendSummaryButton from "../components/dashboard/send-summary-button";
import TestMonthlyEmailButton from "../components/test-monthly-email";
import TestDailyEmailButton from "../components/test-daily-email";
import SignInButton from "../components/sign-in-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="mb-6">You must be signed in to view your reminders.</p>
        <SignOutButton />
        <SignInButton />
      </main>
    );
  }

  if (!session.user?.email) {
    return (
      <main>
        Something went wrong with your user information. Please contact support
      </main>
    );
  }
  const birthdays: BirthdayWithGroup[] | undefined = await getReminders(
    session.user?.email,
  );

  if (!birthdays) {
    return <main>Failed to fetch reminders from database</main>;
  }
  const birthdaysPlainObject: BirthdayPlainObject[] = birthdays.map((bd) => ({
    _id: bd._id.toString(),
    name: bd.name,
    date: bd.date,
    month: bd.month,
    day: bd.day,
    createdBy: bd.createdBy.toString(),
    ...(bd.groupId && { groupId: bd.groupId.toString() }),
    ...(bd.groupName && { groupName: bd.groupName }),
  }));
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-zinc-900 rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
        <div className="flex justify-end">
          <SignOutButton />
          {/* <TestMonthlyEmailButton /> */}
          <TestDailyEmailButton />
        </div>
        <SubscriptionDisplay birthdays={birthdaysPlainObject} />
        <SendSummaryButton birthdays={birthdaysPlainObject} />
        <AddReminderForm key={`v=${birthdays.length}`} />
      </div>
    </main>
  );
}
