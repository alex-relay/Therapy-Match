"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginForm({ csrfToken }: { csrfToken: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      emailAddress: email,
      password,
    });
    return res;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input name="csrfToken" type="hidden" value={csrfToken} />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
