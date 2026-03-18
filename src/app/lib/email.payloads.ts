import { BirthdayPlainObject } from "../schemas/birthday.schema";
import { SubscriptionShape, UserGroupedSubscriptions } from "./db";
import { formatBirthdayLabel } from "./date.utils";
import type {
  DailyEmailTemplateProps,
  EmailBirthdayItem,
  MonthlyEmailTemplateProps,
  ReminderSummaryTemplateProps,
} from "./email.types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getDashboardUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000") + "/dashboard";
}

export function buildReminderSummaryPayload(
  userEmail: string,
  birthdays: BirthdayPlainObject[],
): {
  to: string;
  subject: string;
  templateProps: ReminderSummaryTemplateProps;
} {
  const items: EmailBirthdayItem[] = birthdays.map((b) => ({
    name: b.name,
    label: formatBirthdayLabel(b.month, b.day, b.year),
  }));

  return {
    to: userEmail,
    subject: "Here are all of the birthdays associated with your account!",
    templateProps: {
      userEmail,
      birthdays: items,
      dashboardUrl: getDashboardUrl(),
    },
  };
}

export function buildMonthlyEmailPayload(doc: UserGroupedSubscriptions): {
  to: string;
  subject: string;
  templateProps: MonthlyEmailTemplateProps;
} {
  const monthName =
    MONTH_NAMES[doc.filteredMonth - 1] ?? String(doc.filteredMonth);
  const items: EmailBirthdayItem[] = doc.subscriptions.map(
    (sub: SubscriptionShape) => ({
      name: sub.birthday.name,
      label: formatBirthdayLabel(
        sub.birthday.month,
        sub.birthday.day,
        sub.birthday.year,
      ),
    }),
  );

  return {
    to: doc.userEmail,
    subject: `Birthdays for the month of ${monthName}`,
    templateProps: {
      userEmail: doc.userEmail,
      birthdays: items,
      month: monthName,
      dashboardUrl: getDashboardUrl(),
    },
  };
}

export type DailyBirthdayRecord = {
  _id: unknown;
  birthday: { name: string; month: number; day: number; year?: number };
};

export function buildDailyEmailPayload(
  userEmail: string,
  birthdays: DailyBirthdayRecord[],
  date: Date,
): { to: string; subject: string; templateProps: DailyEmailTemplateProps } {
  const items: EmailBirthdayItem[] = birthdays.map((bd) => ({
    name: bd.birthday.name,
    label: formatBirthdayLabel(
      bd.birthday.month,
      bd.birthday.day,
      bd.birthday.year,
    ),
  }));

  const dateStr = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const count = birthdays.length;
  return {
    to: userEmail,
    subject: `You have ${count} birthday subscription${count === 1 ? "" : "s"} active today`,
    templateProps: {
      userEmail,
      birthdays: items,
      date: dateStr,
      dashboardUrl: getDashboardUrl(),
    },
  };
}
