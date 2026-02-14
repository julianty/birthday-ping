"use client";
import React from "react";
import { sendDailyEmail } from "../lib/email";
import { useSession } from "next-auth/react";

function TestDailyEmailButton() {
  const { data } = useSession();
  if (!data?.user?.email) {
    return null;
  }
  const userEmail = data.user.email;
  return (
    <button onClick={() => sendDailyEmail(userEmail)}>Send Daily Email</button>
  );
}

export default TestDailyEmailButton;
