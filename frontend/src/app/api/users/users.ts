import { useMutation, UseMutationOptions } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Session {
  message: string;
}

export const createAnonymousSession = async () => {
  const response = await fetch(`${API_URL}/anonymous-sessions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const resp = await response.json();
    throw new Error(resp.detail);
  }

  return response.json();
};

export const useCreateAnonymousSession = (
  options?: UseMutationOptions<Session, Error>,
) => {
  return useMutation({
    mutationFn: createAnonymousSession,
    ...options,
  });
};
