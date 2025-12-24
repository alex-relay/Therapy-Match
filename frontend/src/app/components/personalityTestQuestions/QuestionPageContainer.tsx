"use client";

import { PERSONALITY_TEST_QUESTIONS } from "@/app/utils/utils";
import { useState } from "react";
import QuestionPage from "./QuestionPage";
import {
  useGetPersonalityTestScores,
  usePatchPersonalityTestQuestion,
} from "@/app/api/scores/scores";

const QuestionPageContainer = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const { mutate: patchPersonalityTestQuestion } =
    usePatchPersonalityTestQuestion();

  const { data: personalityTestScores } = useGetPersonalityTestScores();

  console.log("Personality Test Scores:", personalityTestScores);

  const handlePreviousQuestionClick = () => {
    setCurrentQuestion((prevState) => prevState - 1);
  };

  const handleNextQuestionClick = () => {
    setCurrentQuestion((prevState) => prevState + 1);
  };

  const handleOptionClick = (index: number, value: number) => {
    const questionAndAnswer = PERSONALITY_TEST_QUESTIONS[index];

    patchPersonalityTestQuestion({
      id: questionAndAnswer.backendId,
      category: questionAndAnswer.category,
      score: value,
    });

    if (currentQuestion < PERSONALITY_TEST_QUESTIONS.length - 1) {
      setCurrentQuestion((prevState) => prevState + 1);
    }
  };

  const { question } = PERSONALITY_TEST_QUESTIONS[currentQuestion];

  const isNextButtonDisabled =
    currentQuestion === PERSONALITY_TEST_QUESTIONS.length - 2;

  return (
    <QuestionPage
      question={question}
      currentQuestion={currentQuestion}
      isNextButtonDisabled={isNextButtonDisabled}
      onOptionClick={handleOptionClick}
      onPreviousQuestionClick={handlePreviousQuestionClick}
      onNextQuestionClick={handleNextQuestionClick}
    />
  );
};

export default QuestionPageContainer;
