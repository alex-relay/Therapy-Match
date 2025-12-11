import { useMutation } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const createPersonalityTest = async () => {
  return await fetch(`${API_URL}/anonymous-sessions/personality-tests`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  }).then(async (response) => {
    if (!response.ok) {
      const resp = await response.json();
      throw new Error(resp.detail);
    }
    return response.json();
  });
};

const useCreatePersonalityTest = () => {
  return useMutation({
    mutationFn: createPersonalityTest,
  });
};

export default useCreatePersonalityTest;
