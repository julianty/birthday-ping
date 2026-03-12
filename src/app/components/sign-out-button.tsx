"use client";
import { signOut } from "next-auth/react";
import React from "react";

function SignOutButton() {
  return (
    <button
      className="text-sm text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-border/50"
      onClick={() => signOut()}
    >
      Sign out
    </button>
  );
}

export default SignOutButton;
