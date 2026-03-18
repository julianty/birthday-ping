import { Section, Text, Link } from "@react-email/components";
import EmailShell from "./shared/email-shell";
import BirthdayList from "./shared/birthday-list";
import type { ReminderSummaryTemplateProps } from "@/app/lib/email.types";

export const PreviewProps: ReminderSummaryTemplateProps = {
  userEmail: "friend@example.com",
  birthdays: [
    { name: "Alice Smith", label: "3/18/1990" },
    { name: "Bob Jones", label: "3/25" },
  ],
  dashboardUrl: "http://localhost:3000/dashboard",
};

export default function ReminderSummaryTemplate({
  userEmail,
  birthdays,
  dashboardUrl,
}: ReminderSummaryTemplateProps) {
  const count = birthdays.length;

  return (
    <EmailShell
      preview={`Your birthday list — ${count} birthday${count === 1 ? "" : "s"}`}
    >
      <Section style={bodySection}>
        <Text style={heading}>Your Birthday List</Text>
        <Text style={subheading}>
          Hi {userEmail}, here are all {count} birthday{count === 1 ? "" : "s"}{" "}
          stored in your account:
        </Text>
        <BirthdayList items={birthdays} />
        <Text style={ctaText}>
          <Link href={dashboardUrl} style={ctaLink}>
            Manage your birthdays →
          </Link>
        </Text>
      </Section>
    </EmailShell>
  );
}

const bodySection = { padding: "24px 32px" };
const heading = {
  fontSize: "22px",
  fontWeight: "700" as const,
  color: "#1c1917",
  margin: "0 0 8px 0",
};
const subheading = { fontSize: "15px", color: "#57534e", margin: "0 0 20px 0" };
const ctaText = { marginTop: "24px" };
const ctaLink = {
  color: "#f59e0b",
  fontWeight: "600" as const,
  textDecoration: "none",
};
