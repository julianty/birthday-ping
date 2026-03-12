import React from "react";
import Link from "next/link";
function SignInButton() {
  return (
    <Link
      className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover active:scale-[0.98] transition-all"
      href={"/register"}
    >
      Sign in
    </Link>
  );
}

export default SignInButton;
