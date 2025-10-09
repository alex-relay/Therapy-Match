import { useMutation, UseMutationOptions } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PatientProfile {
  therapy_needs: string[] | null;
  personality_test_id: string | null;
  location: string | null;
  description: string | null;
  age: number | null;
  gender: string | null;
}

export type PatchQuestionProps = Partial<PatientProfile>;

export const patchQuestion = async ({
  ...profileData
}: PatchQuestionProps): Promise<PatientProfile> => {
  const response = await fetch(`${API_URL}/anonymous-session`, {
    method: "PATCH",
    body: JSON.stringify(profileData),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const resp = await response.json();
    throw new Error(resp);
  }

  return response.json();
};

export const usePatchQuestion = (
  options?: UseMutationOptions<PatientProfile, Error, PatchQuestionProps>,
) => {
  return useMutation({
    mutationFn: patchQuestion,
    ...options,
  });
};
