"use client";
import { signOut } from "next-auth/react";
import React from "react";

function SignOutButton() {
  return (
    <button
      className="dark:bg-destructive hover:bg-destructive-hover text-foreground p-2 rounded-md"
      onClick={() => signOut()}
    >
      Sign Out
    </button>
  );
}

export default SignOutButton;
