"use client";

import { signIn } from "next-auth/react";

export default function RegisterPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-dvh px-4">
      <div className="rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🎂</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to Birthday Ping</h1>
        <p className="text-muted mb-8 text-sm">
          Sign in to start tracking birthdays and never miss one again.
        </p>
        <button
          className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover active:scale-[0.98] transition-all"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
