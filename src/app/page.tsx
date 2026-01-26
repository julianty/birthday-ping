import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start py-0 px-8 bg-white dark:bg-black sm:items-start">
        {/* Hero Section */}
        <section className="px-8 flex flex-col items-start justify-center gap-6 my-16 w-full min-h-[50vh] rounded-3xl">
          <div className="flex flex-col gap-3">
            <h1 className="text-7xl font-extrabold bg-linear-to-r from-pink-700 via-sky-400 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
              Birthday Ping
            </h1>
            <p className="text-xl text-zinc-700 dark:text-zinc-200 font-medium drop-shadow">
              Never forget another birthday
            </p>
          </div>
          <Link
            href="/register"
            className="mt-6 px-10 py-4 rounded-full bg-foreground text-background font-semibold text-xl shadow-lg transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Get started
          </Link>
        </section>

        {/* Info Section */}
        <section className="mb-10 w-full">
          <p className="text-lg text-zinc-700 dark:text-zinc-300 text-center sm:text-left">
            Send yourself an email at the first of each month with the birthdays
            happening that month, or sign up for texts for an SMS reminder on
            the day.
          </p>
        </section>

        {/* Planned Features */}
        <section className="w-full">
          <h3 className="text-2xl font-semibold text-black dark:text-zinc-50 mb-2">
            Planned features:
          </h3>
          <p className="mb-2 text-zinc-600 dark:text-zinc-400">
            Pardon our dust, we&apos;re still getting started!
          </p>
          <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300">
            <li>Calendar .ics exports</li>
            <li>Shared calendars</li>
            <li>Automatic imports via Google or Meta contacts</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
