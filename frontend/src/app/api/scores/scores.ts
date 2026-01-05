import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
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

const createPersonalityTest = async () => {
  const response = await fetch(
    `${API_URL}/anonymous-sessions/personality-tests`,
    {
      method: "POST",
      credentials: "include",
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
    mutationFn: createPersonalityTest,
    ...options,
  });
};

const getPersonalityTestScores =
  async (): Promise<PersonalityTestGetResponse> => {
    const response = await fetch(
      `${API_URL}/anonymous-sessions/personality-tests`,
      {
        method: "GET",
        credentials: "include",
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
    queryFn: getPersonalityTestScores,
  });
};

const patchPersonalityTestQuestion = async (
  question: PersonalityTestQuestionAndScore,
): Promise<PersonalityTestPatchResponse> => {
  const response = await fetch(
    `${API_URL}/anonymous-sessions/personality-tests`,
    {
      method: "PATCH",
      credentials: "include",
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

const usePatchPersonalityTestQuestion = (
  options?: UseMutationOptions<
    PersonalityTestPatchResponse,
    Error,
    PersonalityTestQuestionAndScore,
    MutationContext
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchPersonalityTestQuestion,
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

          allCategoryAnswers.push(score);

          return {
            ...previousScores,
            [category]: allCategoryAnswers,
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
  usePatchPersonalityTestQuestion,
};
