import AddReminderForm from "@/app/components/dashboard/add-reminder-form";
import { getReminders, BirthdayWithGroup } from "@/app/lib/db";
import Image from "next/image";
import SignOutButton from "../components/sign-out-button";
import { auth } from "../auth";
import SubscriptionDisplay from "../components/dashboard/subscription-display";
import { BirthdayPlainObject } from "../schemas/birthday.schema";
import SignInButton from "../components/sign-in-button";
import NextBirthdayCountdown from "../components/dashboard/next-birthday-countdown";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-dvh px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
            <span className="text-3xl">🎂</span>
          </div>
          <h1 className="text-3xl font-bold">Birthday Ping</h1>
          <p className="text-muted">
            Sign in to manage your birthday reminders.
          </p>
          <SignInButton />
        </div>
      </main>
    );
  }

  if (!session.user?.email) {
    return (
      <main className="flex items-center justify-center min-h-dvh px-4">
        <p className="text-muted">
          Something went wrong with your user information. Please contact
          support.
        </p>
      </main>
    );
  }

  const birthdays: BirthdayWithGroup[] | undefined = await getReminders(
    session.user.email,
  );

  if (!birthdays) {
    return (
      <main className="flex items-center justify-center min-h-dvh px-4">
        <p className="text-muted">Failed to fetch reminders from database.</p>
      </main>
    );
  }

  // Need to create a plain object to pass to a client component
  const birthdaysPlainObject: BirthdayPlainObject[] = birthdays.map((bd) => ({
    _id: bd._id.toString(),
    name: bd.name,
    date: bd.date,
    month: bd.month,
    day: bd.day,
    ...(typeof bd.year === "number" ? { year: bd.year } : {}),
    createdBy: bd.createdBy.toString(),
    ...(bd.groupId && { groupId: bd.groupId.toString() }),
    ...(bd.groupName && { groupName: bd.groupName }),
  }));

  const userName = session.user?.name ?? "User";
  const userImage = session.user?.image;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            {userImage ? (
              <Image
                src={userImage}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-sm truncate max-w-40">
              {userName}
            </span>
          </div>
          <SignOutButton />
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
          <NextBirthdayCountdown birthdays={birthdaysPlainObject} />
          <SubscriptionDisplay birthdays={birthdaysPlainObject} />
        </div>
      </main>

      {/* FAB + Add Reminder modal */}
      <AddReminderForm key={`v=${birthdays.length}`} />
    </div>
  );
}
