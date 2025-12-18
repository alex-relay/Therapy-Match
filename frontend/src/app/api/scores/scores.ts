import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type PersonalityTestAggregateScores = {
  extroversion: [];
  conscientiousness: [];
  openness: [];
  neuroticism: [];
  agreeableness: [];
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

const getPersonalityTestScores = async () => {
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

export { useCreatePersonalityTest, useGetPersonalityTestScores };
