"use client";
import { signOut } from "next-auth/react";
import React from "react";

function SignOutButton() {
  return <button onClick={() => signOut()}>Sign Out</button>;
}

export default SignOutButton;
