import Link from "next/link";
import FeatureCard from "@/app/components/home/feature-card";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center my-12">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
          <span className="text-5xl">🎂</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">
          Birthday <span className="text-accent">Ping</span>
        </h1>

        <p className="text-lg text-muted max-w-md mb-8">
          Get a monthly email digest of upcoming birthdays so you never miss
          a&nbsp;celebration&nbsp;again.
        </p>

        <Link
          href="/login"
          className="px-8 py-3.5 rounded-xl bg-accent text-white font-semibold text-base shadow-lg shadow-accent/20 hover:bg-accent-hover active:scale-[0.97] transition-all"
        >
          Get started — it&apos;s free
        </Link>
      </section>

      {/* Feature cards */}
      <section className="max-w-3xl mx-auto w-full px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureCard
            emoji="📬"
            title="Monthly Digests"
            description="Receive an email on the 1st with every birthday that month."
          />
          <FeatureCard
            emoji="👥"
            title="Groups"
            description="Organise birthdays into family, friends, coworkers — whatever you like."
          />
          <FeatureCard
            emoji="⚡"
            title="Quick Add"
            description="Add a birthday in seconds. No clutter, no calendar apps."
          />
          <FeatureCard
            emoji="📅"
            title="Calendar .ics Exports"
            description="Export selected birthdays to an .ics file and import into your favorite calendar."
          />
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">
            Coming soon
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "Shared calendars",
              "Google contacts import",
              "SMS day-of reminders",
            ].map((feature) => (
              <span
                key={feature}
                className="text-sm px-3 py-1.5 rounded-full border border-border text-muted"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
