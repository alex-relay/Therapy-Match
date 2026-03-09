import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { PersonalityTestQuestionAndScore } from "../scores/scores";

const PROXY_URL = process.env.NEXT_PUBLIC_API_URL;

export const TherapyNeedsOptionsAndSpecializationsMap = {
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

export type TherapyNeedsOptions =
  keyof typeof TherapyNeedsOptionsAndSpecializationsMap;

export type TherapistSpecializationsOptions =
  keyof typeof TherapyNeedsOptionsAndSpecializationsMap;

export type Coordinate = {
  latitude: number;
  longitude: number;
};

interface UserProfileRequestBase {
  personality_test_id: string | null;
  postal_code: string | null;
  description: string | null;
  age: number | null;
  gender: string | null;
  religion: string | null;
}

export interface TherapistProfilePatchRequest extends UserProfileRequestBase {
  therapist_type: string | null;
  specializations: TherapistSpecializationsOptions[] | null;
  is_lgbtq_specialization: boolean | null;
  is_religious_specialization: boolean | null;
}

export interface PatientProfilePatchRequest extends UserProfileRequestBase {
  therapy_needs: TherapyNeedsOptions[] | null;
  is_religious_therapist_preference: boolean | null;
  is_lgbtq_therapist_preference: boolean | null;
}

interface UserProfileResponseBase {
  age: number | null;
  gender: string | null;
  latitude: number | null;
  longitude: number | null;
  postal_code: string | null;
  personality_test_id: string | null;
  id: string;
}

export interface PatientProfileResponse extends UserProfileResponseBase {
  therapy_needs: TherapyNeedsOptions[] | null;
  description: string | null;
  is_religious_therapist_preference: boolean | null;
  is_lgbtq_therapist_preference: boolean | null;
}

export type PatchQuestionProps = Partial<PatientProfilePatchRequest>;

export type PatchAnonymousQuestionHookProps = {
  options?: UseMutationOptions<
    PatientProfileResponse,
    Error,
    PatchQuestionProps
  >;
};

export type PatchTherapistProfileProps = Partial<TherapistProfilePatchRequest>;

export interface TherapistProfileResponse extends UserProfileResponseBase {
  therapist_type: string | null;
  specializations: TherapistSpecializationsOptions[] | null;
  is_lgbtq_specialization: boolean | null;
  is_religious_specialization: boolean | null;
  is_profile_complete: boolean | null;
  id: string;
}

type TherapistDashboardResponse = {
  personality_test_scores: {
    openness: PersonalityTestQuestionAndScore[];
    conscientiousness: PersonalityTestQuestionAndScore[];
    extraversion: PersonalityTestQuestionAndScore[];
    agreeableness: PersonalityTestQuestionAndScore[];
    neuroticism: PersonalityTestQuestionAndScore[];
  };
  completed_personality_test: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  is_profile_complete: boolean;
};

export const patchAnonymousQuestion = async ({
  ...profileData
}: PatchQuestionProps): Promise<PatientProfileResponse> => {
  const response = await fetch(`${PROXY_URL}/anonymous-sessions`, {
    method: "PATCH",
    body: JSON.stringify(profileData),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const resp = await response.json();
    throw new Error(resp.detail || resp.message || "Failed to update session");
  }

  return response.json();
};

const usePatchAnonymousQuestion = ({
  options,
}: PatchAnonymousQuestionHookProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchAnonymousQuestion,
    onMutate: async (sessionUpdate) => {
      await queryClient.cancelQueries({
        queryKey: ["anonymousPatientSession"],
      });

      const currentAnonymousSession = queryClient.getQueryData([
        "anonymousPatientSession",
      ]);

      queryClient.setQueryData(
        ["anonymousPatientSession"],
        (oldSession: PatientProfileResponse) => ({
          ...oldSession,
          ...sessionUpdate,
        }),
      );

      return { currentAnonymousSession };
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["anonymousPatientSession"] }),
    ...options,
  });
};

const patchTherapistProfile = async ({
  ...profile
}: PatchTherapistProfileProps): Promise<TherapistProfileResponse> => {
  const response = await fetch(`${PROXY_URL}/therapists/me`, {
    method: "PATCH",
    body: JSON.stringify(profile),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const res = await response.json();

    throw new Error(
      res.detail || res.msg || "Error on updating a therapist profile",
    );
  }

  const data = await response.json();
  return data;
};

const usePatchTherapistProfile = (
  options?: UseMutationOptions<
    TherapistProfileResponse,
    Error,
    PatchTherapistProfileProps,
    { previousTherapistState: TherapistProfileResponse | undefined }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchTherapistProfile,
    onMutate: async (newProfileData) => {
      await queryClient.cancelQueries({ queryKey: ["therapist", "profile"] });

      const previousTherapistState: TherapistProfileResponse | undefined =
        queryClient.getQueryData(["therapist", "profile"]);

      queryClient.setQueryData(
        ["therapist", "profile"],
        (old: TherapistProfileResponse) => ({
          ...old,
          ...newProfileData,
        }),
      );

      return { previousTherapistState };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(
        ["therapist", "profile"],
        context?.previousTherapistState,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist", "profile"] });
    },
    ...options,
  });
};

const getTherapistProfile = async (): Promise<TherapistProfileResponse> => {
  const response = await fetch(`${PROXY_URL}/therapists/me`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorMsg = await response.json();
    throw new Error(
      errorMsg["detail"] || "Unable to load the therapist profile",
    );
  }

  const data = response.json();
  return data;
};

const useGetTherapistProfile = (
  options?: Omit<
    UseQueryOptions<TherapistProfileResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryFn: getTherapistProfile,
    queryKey: ["therapist", "profile"],
    ...options,
  });
};

const getAnonymousPatientSession =
  async (): Promise<PatientProfileResponse> => {
    const response = await fetch(`${PROXY_URL}/anonymous-sessions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const resp = await response.json();
      throw new Error(
        resp.detail ||
          resp.message ||
          "Failed to fetch anonymous patient session",
      );
    }
    return response.json();
  };

// TODO: refactor the error handling to put the try/catch block in a function
const getTherapistDashboard = async (): Promise<TherapistDashboardResponse> => {
  const response = await fetch(`${PROXY_URL}/therapists/me/dashboard`, {
    method: "GET",
  });

  if (!response.ok) {
    const resp = await response.json();
    throw new Error(
      resp.detail || resp.message || "Failed to fetch therapist dashboard",
    );
  }

  const data = await response.json();
  return data;
};

const useGetTherapistDashboard = (
  options?: Omit<
    UseQueryOptions<TherapistDashboardResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: ["therapist", "dashboard"],
    queryFn: getTherapistDashboard,
    ...options,
  });
};

const useGetAnonymousPatientSession = (
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

export {
  useGetTherapistDashboard,
  useGetAnonymousPatientSession,
  usePatchAnonymousQuestion,
  useGetTherapistProfile,
  usePatchTherapistProfile,
};
