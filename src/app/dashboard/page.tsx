import AddReminderForm from "@/app/components/dashboard/add-reminder-form";
import { getReminders } from "@/app/lib/db";
import SignOutButton from "../components/sign-out-button";
import { auth } from "../auth";
import SubscriptionDisplay from "../components/dashboard/subscription-display";
import { BirthdayDB, BirthdayPlainObject } from "../schemas/birthday.schema";
import SendSummaryButton from "../components/dashboard/send-summary-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="mb-6">You must be signed in to view your reminders.</p>
        <SignOutButton />
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
  const birthdays: BirthdayDB[] | undefined = await getReminders(
    session.user?.email,
  );

  if (!birthdays) {
    return <main>Failed to fetch reminders from database</main>;
  }
  const birthdaysPlainObject: BirthdayPlainObject[] | undefined = birthdays.map(
    (bd) => {
      const plainBd = {
        ...bd,
        _id: bd._id.toString(),
        createdBy: bd.createdBy.toString(),
      };
      return plainBd;
    },
  );
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-zinc-900 rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
        <SubscriptionDisplay birthdays={birthdaysPlainObject} />
        <SendSummaryButton birthdays={birthdaysPlainObject} />
        <AddReminderForm key={`v=${birthdays.length}`} />
      </div>
      <SignOutButton />
    </main>
  );
}
