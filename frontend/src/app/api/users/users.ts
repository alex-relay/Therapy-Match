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

export type UserType = "patient" | "therapist";

type CreateUserProps = {
  first_name: string;
  last_name: string;
  email_address: string;
  password: string;
  user_type: UserType;
};

type Token = {
  access_token: string;
  token_type: string;
  user: {
    email_address: string;
  };
  roles: UserType[];
};

type LoginCredentialsProps = {
  email_address: string;
  password: string;
};

type Patient = {
  therapy_needs: string;
  latitude: number;
  longitude: number;
  gender: string;
  age: number;
  personality_test_id: string;
  is_religious_therapist_preference: boolean;
  is_lgbtq_therapist_preference: boolean;
  id: string;
};

const createUser = ({
  user_type,
  ...formData
}: CreateUserProps): Promise<Patient> => {
  const endpoint =
    user_type === "patient" ? `${API_URL}/patients` : `${API_URL}/therapists`;

  return fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ ...formData, user_type }),
  }).then(async (response) => {
    if (!response.ok) {
      const resp = await response.json();
      throw new Error(resp.detail);
    }
    return response.json();
  });
};

const authenticateUserLogin = ({
  email_address,
  password,
}: LoginCredentialsProps): Promise<Token> => {
  return fetch(`${API_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      username: email_address,
      password: password,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      const resp = await response.json();
      throw new Error(resp.detail);
    }
    return response.json();
  });
};

const useCreateUser = (
  options?: UseMutationOptions<Patient, Error, CreateUserProps>,
) => {
  return useMutation({
    mutationFn: createUser,
    ...options,
  });
};

const useAuthenticateUser = (
  options?: UseMutationOptions<Token, Error, LoginCredentialsProps>,
) => {
  return useMutation({
    mutationFn: authenticateUserLogin,
    ...options,
  });
};

export { useCreateUser, createUser, useAuthenticateUser };
