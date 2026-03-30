# 🎂 Birthday Ping

**Never miss a birthday again.** Birthday Ping is a full-stack web app that lets you track birthdays and automatically sends you email reminders — a monthly digest on the 1st and a day-of nudge when someone's birthday arrives.

You add birthdays once, organise them into groups, and Birthday Ping handles the rest.

## Features

- 📬 **Monthly Digest Emails** — On the 1st of each month, receive an email listing every birthday coming up that month.
- 🔔 **Daily Birthday Reminders** — Get an email on the day of each birthday so you never forget to reach out.
- 👥 **Groups** — Organise birthdays into family, friends, coworkers, or any custom category.
- ⚡ **Quick Add** — Add a birthday in seconds with a simple form — name, date, and optional group.
- 📅 **Calendar .ics Export** — Select birthdays and export them as a standard `.ics` file to import into Google Calendar, Apple Calendar, Outlook, etc.
- 📥 **Calendar .ics Import** — Upload a `.ics` file, preview the parsed entries, and choose which ones to add.
- 🗑️ **Bulk Actions** — Select multiple birthdays for bulk deletion or bulk group reassignment.
- 🔐 **Google Sign-In** — Authentication via Google OAuth through NextAuth, with sessions backed by a MongoDB adapter.

### Coming Soon

- Shared calendars
- Google Contacts import
- SMS day-of reminders

## How It Works

Birthday Ping is built with the **Next.js App Router**. All data lives in **MongoDB** — users, birthdays, subscriptions (the link between a user and a birthday), and groups. Authentication is handled by **NextAuth** with a Google OAuth provider and a MongoDB session adapter.

Email delivery is powered by **Resend** with templates built using **React Email**, giving full control over the email markup using React components.

Two automated jobs handle the reminder emails:

- **Monthly Digest** — A GitHub Actions cron job fires on the 1st of each month, calling the `POST /api/jobs/send-monthly` endpoint. The API aggregates each user's subscribed birthdays for that month and sends a personalised digest email.
- **Daily Reminder** — A GitHub Actions cron job fires daily, calling `POST /api/jobs/send-daily` for each user. The API checks for birthdays matching today's date and sends a day-of reminder.

Both endpoints are protected by shared secrets (`GITHUB_JOB_SECRET` / `GITHUB_MONTHLY_JOB_SECRET`) so they can only be triggered by the Actions workflows.

All form inputs and API request bodies are validated with **Zod** schemas.

## Tech Stack

| Layer       | Technology                                                          |
| ----------- | ------------------------------------------------------------------- |
| Framework   | [Next.js 16](https://nextjs.org/) (App Router, Server Actions)      |
| Language    | TypeScript 5                                                        |
| Styling     | Tailwind CSS v4                                                     |
| Auth        | NextAuth v4 + Google OAuth                                          |
| Database    | MongoDB (`mongodb` driver + `@auth/mongodb-adapter`)                |
| Email       | [Resend](https://resend.com/) + [React Email](https://react.email/) |
| Validation  | Zod                                                                 |
| ICS Parsing | `node-ical`                                                         |
| Scheduling  | GitHub Actions (cron)                                               |
| Deployment  | Vercel                                                              |

## Project Structure

```
src/app/
├── api/
│   ├── auth/[...nextauth]/   # NextAuth route handler
│   ├── birthdays/             # CRUD, import, export, bulk-delete
│   ├── groups/                # Group CRUD + membership
│   ├── jobs/                  # Cron-triggered email endpoints
│   └── subscriptions/         # User ↔ birthday link management
├── components/
│   ├── dashboard/             # Dashboard UI (forms, modals, bulk actions)
│   ├── emails/                # React Email templates (daily, monthly, summary)
│   └── home/                  # Landing page components
├── dashboard/                 # Authenticated dashboard page + server actions
├── lib/                       # DB helpers, email logic, ICS generation, date utils
├── schemas/                   # Zod schemas (birthday, group, subscription, etc.)
└── login/                     # Login page
```
