import { useMutation, UseMutationOptions } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export interface PatientProfilePatchRequest {
  therapy_needs: string[] | null;
  personality_test_id: string | null;
  postal_code: string | null;
  description: string | null;
  age: number | null;
  gender: string | null;
  religion: string | null;
}

export interface PatientProfileResponse {
  therapy_needs: string[] | null;
  personality_test_id: string | null;
  location: Coordinate | null;
  description: string | null;
  age: number | null;
  gender: string | null;
  latitude: number | null;
  longitude: number | null;
}

export type PatchQuestionProps = Partial<PatientProfilePatchRequest>;

export const patchQuestion = async ({
  ...profileData
}: PatchQuestionProps): Promise<PatientProfileResponse> => {
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
  options?: UseMutationOptions<
    PatientProfileResponse,
    Error,
    PatchQuestionProps
  >,
) => {
  return useMutation({
    mutationFn: patchQuestion,
    ...options,
  });
};
