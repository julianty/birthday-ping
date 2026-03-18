import {
  Html,
  Head,
  Body,
  Container,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { type ReactNode } from "react";

type EmailShellProps = {
  preview: string;
  children: ReactNode;
};

export default function EmailShell({ preview, children }: EmailShellProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Text style={logoStyle}>🎂 Birthday Ping</Text>
          </Section>
          {children}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              You&apos;re receiving this because you have birthday subscriptions
              set up on Birthday Ping.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#fafaf9",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const containerStyle = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "580px",
  borderRadius: "8px",
  border: "1px solid #e7e5e4",
  overflow: "hidden" as const,
};

const headerStyle = {
  backgroundColor: "#f59e0b",
  padding: "24px 32px",
};

const logoStyle = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: "700" as const,
  margin: "0",
};

const footerStyle = {
  padding: "16px 32px",
  borderTop: "1px solid #e7e5e4",
};

const footerTextStyle = {
  color: "#a8a29e",
  fontSize: "12px",
  margin: "0",
};
