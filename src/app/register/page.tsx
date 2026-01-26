"use client";

import { signIn } from "next-auth/react";

export default function RegisterPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Register</h1>
        <p className="mb-6">
          The app is currently in development and we only have Google as an
          OAuth provider as yet.
        </p>
        <button
          className="bg-button p-2 rounded-lg"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
