"use client";

import QuestionPage from "./QuestionPage";
import { useGetPersonalityTestScores } from "@/app/api/scores/scores";

const QuestionPageContainer = () => {
  const {
    data: personalityTestScores,
    isLoading: isPersonalityTestScoresLoading,
  } = useGetPersonalityTestScores();

  if (isPersonalityTestScoresLoading) {
    return <div>Loading...</div>;
  }

  return <QuestionPage personalityTestScores={personalityTestScores} />;
};

export default QuestionPageContainer;
