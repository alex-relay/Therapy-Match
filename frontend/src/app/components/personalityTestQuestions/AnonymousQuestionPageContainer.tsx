"use client";

import AnonymousTestQuestionPage from "./AnonymousTestQuestionPage";
import {
  useGetPersonalityTestScores,
  usePatchAnonymousPersonalityTestQuestion,
} from "@/app/api/scores/scores";

const AnonymousTestQuestionPageContainer = () => {
  const {
    data: personalityTestScores,
    isLoading: isPersonalityTestScoresLoading,
  } = useGetPersonalityTestScores();

  const { mutate: patchAnonymousPersonalityTestQuestion } =
    usePatchAnonymousPersonalityTestQuestion();

  if (isPersonalityTestScoresLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AnonymousTestQuestionPage
      personalityTestScores={personalityTestScores}
      onAnswerQuestion={patchAnonymousPersonalityTestQuestion}
    />
  );
};

export default AnonymousTestQuestionPageContainer;
