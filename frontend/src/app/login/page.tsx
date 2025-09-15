"use client";

import SignInSide from "../components/login/SignInSide";

export default function LoginForm({ csrfToken }: { csrfToken: string }) {
  return <SignInSide csrfToken={csrfToken} />;
}
