import { Section, Row, Column, Text } from "@react-email/components";
import type { EmailBirthdayItem } from "@/app/lib/email.types";

type BirthdayListProps = {
  items: EmailBirthdayItem[];
};

export default function BirthdayList({ items }: BirthdayListProps) {
  if (items.length === 0) {
    return (
      <Section style={emptyStyle}>
        <Text style={emptyTextStyle}>No birthdays to show.</Text>
      </Section>
    );
  }

  return (
    <Section>
      {items.map((item, i) => (
        <Row key={i} style={rowStyle}>
          <Column style={emojiColStyle}>
            <Text style={emojiStyle}>🎉</Text>
          </Column>
          <Column>
            <Text style={nameStyle}>{item.name}</Text>
            <Text style={dateStyle}>{item.label}</Text>
          </Column>
        </Row>
      ))}
    </Section>
  );
}

const rowStyle = {
  borderBottom: "1px solid #f5f5f4",
  padding: "10px 0",
};

const emojiColStyle = {
  width: "36px",
};

const emojiStyle = {
  fontSize: "20px",
  margin: "0",
  lineHeight: "1.2",
};

const nameStyle = {
  fontWeight: "600" as const,
  fontSize: "15px",
  color: "#1c1917",
  margin: "0 0 2px 0",
};

const dateStyle = {
  fontSize: "13px",
  color: "#78716c",
  margin: "0",
};

const emptyStyle = {
  padding: "16px 0",
};

const emptyTextStyle = {
  color: "#a8a29e",
  fontSize: "14px",
  margin: "0",
};
