"use client";
import { signIn, signOut } from "next-auth/react";

export function SignInOutButtons({ signedIn }: { signedIn: boolean }) {
  return signedIn ? (
    <button
      className="rounded bg-red-500 text-white px-4 py-2 hover:bg-red-600"
      onClick={() => signOut()}
    >
      Sign out
    </button>
  ) : (
    <button
      className="rounded bg-blue-500 text-white px-4 py-2 hover:bg-blue-600"
      onClick={() => signIn("github")}
    >
      Sign in with GitHub
    </button>
  );
} 