export type EmailBirthdayItem = {
  name: string;
  label: string;
};

export type DailyEmailTemplateProps = {
  userEmail: string;
  birthdays: EmailBirthdayItem[];
  date: string;
  dashboardUrl: string;
};

export type MonthlyEmailTemplateProps = {
  userEmail: string;
  birthdays: EmailBirthdayItem[];
  month: string;
  dashboardUrl: string;
};

export type ReminderSummaryTemplateProps = {
  userEmail: string;
  birthdays: EmailBirthdayItem[];
  dashboardUrl: string;
};
