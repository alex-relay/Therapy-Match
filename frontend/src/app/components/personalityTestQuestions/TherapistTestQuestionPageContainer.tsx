"use client";

import TherapistTestQuestionPage from "./TherapistTestQuestionPage";
import {
  usePatchTherapistPersonalityTest,
  useGetTherapistPersonalityTest,
} from "@/app/api/scores/scores";

const TherapistTestQuestionPageContainer = () => {
  const {
    data: therapistPersonalityTest,
    isLoading: isTherapistPersonalityTestLoading,
  } = useGetTherapistPersonalityTest();

  const { mutate: patchTherapistPersonalityTestQuestion } =
    usePatchTherapistPersonalityTest();

  if (isTherapistPersonalityTestLoading) {
    return <div>Loading...</div>;
  }

  return (
    <TherapistTestQuestionPage
      personalityTestScores={therapistPersonalityTest}
      onAnswerQuestion={patchTherapistPersonalityTestQuestion}
    />
  );
};

export default TherapistTestQuestionPageContainer;
