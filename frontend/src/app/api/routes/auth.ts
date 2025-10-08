import { useMutation, UseMutationOptions } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type createUserProps = {
  first_name: string;
  last_name: string;
  email_address: string;
  password: string;
};

interface User {
  first_name: string;
  last_name: string;
  email_address: string;
  password: string;
}

// TODO: We need to hash the password on the client side in the request.
const createUser = (formData: createUserProps): Promise<User> => {
  return fetch(`${API_URL}/users`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(formData),
  }).then(async (response) => {
    if (!response.ok) {
      const resp = await response.json();
      throw new Error(resp.detail);
    }
    return response.json();
  });
};

const useCreateUser = (
  options?: UseMutationOptions<User, Error, createUserProps>,
) => {
  return useMutation({
    mutationFn: createUser,
    ...options,
  });
};

export { useCreateUser, createUser };
