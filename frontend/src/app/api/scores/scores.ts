import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CategoryType =
  | "extroversion"
  | "agreeableness"
  | "conscientiousness"
  | "neuroticism"
  | "openness";

export type PersonalityTestQuestionAndScore = {
  score: number;
  category: CategoryType;
  id: string;
};

type PersonalityTestAggregateScores = {
  extroversion: [];
  conscientiousness: [];
  openness: [];
  neuroticism: [];
  agreeableness: [];
};

type PersonalityTestPatchResponse = {
  id: string;
  extroversion: PersonalityTestQuestionAndScore[];
  conscientiousness: PersonalityTestQuestionAndScore[];
  openness: PersonalityTestQuestionAndScore[];
  neuroticism: PersonalityTestQuestionAndScore[];
  agreeableness: PersonalityTestQuestionAndScore[];
};

export type PersonalityTestGetResponse = {
  id: string;
  extroversion: PersonalityTestQuestionAndScore[];
  conscientiousness: PersonalityTestQuestionAndScore[];
  openness: PersonalityTestQuestionAndScore[];
  neuroticism: PersonalityTestQuestionAndScore[];
  agreeableness: PersonalityTestQuestionAndScore[];
};

export type CreateTherapistPersonalityTestResponse = {
  id: string;
};

const createTherapistPersonalityTest = async () => {
  const response = await fetch(`${API_URL}/therapists/me/personality-tests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    let errorMessage = `Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = errorData.detail;
      }
    } catch (error) {
      console.warn(`Non-JSON error response received: ${error}`);
    }
    throw new Error(errorMessage);
  }

  const data = response.json();
  return data;
};

const useCreateTherapistPersonalityTest = (
  options?: UseMutationOptions<CreateTherapistPersonalityTestResponse, Error>,
) => {
  return useMutation({
    mutationFn: createTherapistPersonalityTest,
    ...options,
  });
};

const getTherapistPersonalityTest =
  async (): Promise<PersonalityTestGetResponse> => {
    const response = await fetch(`${API_URL}/therapists/me/personality-test`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorMsg = await response.json();
      throw new Error(
        errorMsg["detail"] || "Unable to get the therapist personality test",
      );
    }

    const data = await response.json();
    return data;
  };

const useGetTherapistPersonalityTest = (
  options?: Omit<
    UseQueryOptions<PersonalityTestGetResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryFn: getTherapistPersonalityTest,
    queryKey: ["therapist", "personality-test"],
    ...options,
  });
};

const patchTherapistPersonalityTest = async (
  question: PersonalityTestQuestionAndScore,
): Promise<PersonalityTestPatchResponse> => {
  const response = await fetch(`${API_URL}/therapists/me/personality-test`, {
    method: "PATCH",
    body: JSON.stringify(question),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const res = await response.json();
    throw new Error(
      res?.detail ||
        res?.msg ||
        "Unable to update the therapist personality tests",
    );
  }

  const data = await response.json();

  return data;
};

const usePatchTherapistPersonalityTest = (
  options?: UseMutationOptions<
    PersonalityTestPatchResponse,
    Error,
    PersonalityTestQuestionAndScore,
    { currentTest: PersonalityTestGetResponse }
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchTherapistPersonalityTest,
    onMutate: (question) => {
      queryClient.cancelQueries({
        queryKey: ["therapist", "personality-test"],
      });

      const currentTest = queryClient.getQueryData([
        "therapist",
        "personality-test",
      ]);

      queryClient.setQueryData(
        ["therapist", "personality-test"],
        (
          currentTest: PersonalityTestGetResponse,
        ): PersonalityTestGetResponse => {
          const category = question.category;
          const currentTestCopy = { ...currentTest };
          const currentTestCategoryAnswers = currentTestCopy[category];

          const isAnswerExists = currentTestCategoryAnswers.find(
            (answer) => question.id === answer.id,
          );

          if (isAnswerExists) {
            const updatedCategory = currentTestCategoryAnswers.map((answer) =>
              answer.id === question.id ? question : answer,
            );
            return {
              ...currentTestCopy,
              [category]: updatedCategory,
            };
          } else {
            return {
              ...currentTestCopy,
              [category]: [...currentTestCategoryAnswers, question],
            };
          }
        },
      );

      return { currentTest };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(
        ["therapist", "personality-test"],
        context?.currentTest,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["therapist", "personality-test"],
      });
    },
  });
};

// TODO: need to change the endpoint name to: `.../anonymous-sessions/current/personality-tests`
const createAnonymousSessionPersonalityTest = async () => {
  const response = await fetch(
    `${API_URL}/anonymous-sessions/personality-tests`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    let errorMessage = `Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = errorData?.detail;
      }
    } catch (error) {
      console.warn(`Non-JSON error response received: ${error}`);
    }
    throw new Error(errorMessage);
  }

  const data = response.json();

  return data;
};

const useCreatePersonalityTest = (
  options?: UseMutationOptions<PersonalityTestAggregateScores, Error>,
) => {
  return useMutation<PersonalityTestAggregateScores>({
    mutationFn: createAnonymousSessionPersonalityTest,
    ...options,
  });
};

const getAnonymousSessionPersonalityTestScores =
  async (): Promise<PersonalityTestGetResponse> => {
    const response = await fetch(
      `${API_URL}/anonymous-sessions/personality-tests`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      let errorMessage = `Error: ${response.status}`;

      try {
        const errorData = await response.json();
        if (errorData?.detail) {
          errorMessage = errorData?.detail;
        }
      } catch (error) {
        console.warn(`Non-JSON error response received: ${error}`);
      }
      throw new Error(errorMessage);
    }

    const data = response.json();

    return data;
  };

const useGetPersonalityTestScores = () => {
  return useQuery({
    queryKey: ["personalityTest, scores"],
    queryFn: getAnonymousSessionPersonalityTestScores,
  });
};

const patchAnonymousPersonalityTestQuestion = async (
  question: PersonalityTestQuestionAndScore,
): Promise<PersonalityTestPatchResponse> => {
  const response = await fetch(
    `${API_URL}/anonymous-sessions/personality-tests`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(question),
    },
  );

  if (!response.ok) {
    let errorMessage = `Error: ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = errorData?.detail;
      }
    } catch (error) {
      console.warn(`Non-JSON error response received: ${error}`);
    }
    throw new Error(errorMessage);
  }

  const data = response.json();

  return data;
};

type MutationContext = { previousScores: PersonalityTestPatchResponse };

const usePatchAnonymousPersonalityTestQuestion = (
  options?: UseMutationOptions<
    PersonalityTestPatchResponse,
    Error,
    PersonalityTestQuestionAndScore,
    MutationContext
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchAnonymousPersonalityTestQuestion,
    onMutate: async (
      score,
    ): Promise<{ previousScores: PersonalityTestPatchResponse }> => {
      await queryClient.cancelQueries({
        queryKey: ["personalityTest, scores"],
      });

      const previousScores = queryClient.getQueryData([
        "personalityTest, scores",
      ]) as PersonalityTestPatchResponse;

      queryClient.setQueryData(
        ["personalityTest, scores"],
        (previousScores: PersonalityTestPatchResponse) => {
          const category = score.category as keyof Omit<
            PersonalityTestPatchResponse,
            "id"
          >;

          const isPreviousScoreExists = previousScores[category].find(
            (prevScore) => prevScore.id === score.id,
          );

          const allCategoryAnswers = previousScores[category];

          if (isPreviousScoreExists) {
            const updatedCategoryScores = allCategoryAnswers.map(
              (prevScore) => {
                if (prevScore.id === score.id) {
                  return { ...prevScore, score: score.score };
                }
                return prevScore;
              },
            );
            return {
              ...previousScores,
              [category]: updatedCategoryScores,
            };
          }

          const updatedAllCategoryAnswers = [...allCategoryAnswers, score];

          return {
            ...previousScores,
            [category]: updatedAllCategoryAnswers,
          };
        },
      );

      return { previousScores };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(
        ["personalityTest, scores"],
        context?.previousScores,
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["personalityTest, scores"] }),
    ...options,
  });
};

export {
  useCreatePersonalityTest,
  useGetPersonalityTestScores,
  usePatchAnonymousPersonalityTestQuestion,
  useCreateTherapistPersonalityTest,
  useGetTherapistPersonalityTest,
  usePatchTherapistPersonalityTest,
};
