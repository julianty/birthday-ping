import React from "react";
import Link from "next/link";
function SignInButton() {
  return (
    <Link
      className="dark:bg-foreground text-background hover:bg-primary-hover  p-2 rounded-md"
      href={"/register"}
    >
      Sign in
    </Link>
  );
}

export default SignInButton;
