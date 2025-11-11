import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const TherapyNeedsOptionsMap = {
  anxiety: "Anxiety",
  depression: "Depression",
  trauma_ptsd: "Trauma and PTSD",
  relationships: "Relationship problems",
  life_transitions: "Major life transitions",
  grief: "Grief and loss",
  substance_abuse: "Substance abuse and addiction",
  self_esteem: "Low self-esteem",
  stress: "Stress",
  coping_mechanisms: "Unhealthy coping mechanisms",
  eating_disorders: "Eating disorder",
  anger_management: "Anger management",
  adhd: "ADHD",
  insomnia: "Insomnia",
  mood_disorders: "Depression/Mood disorders",
  personality_disorders: "Personality Disorders",
  attention_focus: "Attention and focus issues",
} as const;

export type TherapyNeedsOptions = keyof typeof TherapyNeedsOptionsMap;

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export interface PatientProfilePatchRequest {
  therapy_needs: TherapyNeedsOptions[] | null;
  personality_test_id: string | null;
  postal_code: string | null;
  description: string | null;
  age: number | null;
  gender: string | null;
  religion: string | null;
  is_religious_therapist_preference: boolean | null;
  is_lgbtq_therapist_preference: boolean | null;
}

export interface PatientProfileResponse {
  therapy_needs: TherapyNeedsOptions[] | null;
  personality_test_id: string | null;
  location: Coordinate | null;
  description: string | null;
  age: number | null;
  gender: string | null;
  latitude: number | null;
  longitude: number | null;
  is_religious_therapist_preference: boolean | null;
  is_lgbtq_therapist_preference: boolean | null;
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

const getAnonymousPatientSession =
  async (): Promise<PatientProfileResponse> => {
    const response = await fetch(`${API_URL}/anonymous-session`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const resp = await response.json();
      throw new Error(
        resp.detail || resp.message || "Failed to fetch anonymous session",
      );
    }
    return response.json();
  };

export const useGetAnonymousPatientSession = (
  options?: Omit<
    UseQueryOptions<PatientProfileResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ["anonymousPatientSession"],
    queryFn: getAnonymousPatientSession,
    ...options,
  });
};
