"use client";
import React from "react";
import { sendMonthlyEmail } from "../lib/email";

function TestMonthlyEmailButton() {
  return <button onClick={() => sendMonthlyEmail()}>Send Monthly Email</button>;
}

export default TestMonthlyEmailButton;
