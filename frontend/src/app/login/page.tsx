"use client";

import SignInSide from "../components/SignInSide";
import AppBar from "../components/AppBar";

export default function LoginForm({ csrfToken }: { csrfToken: string }) {
  return (
    <>
      <AppBar />
      <SignInSide csrfToken={csrfToken} />
    </>
  );
}
