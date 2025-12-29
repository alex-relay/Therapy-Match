"use client";

import { PERSONALITY_TEST_QUESTIONS } from "@/app/utils/utils";
import { useState } from "react";
import QuestionPage from "./QuestionPage";
import {
  PersonalityTestQuestionAndScore,
  useGetPersonalityTestScores,
  usePatchPersonalityTestQuestion,
} from "@/app/api/scores/scores";

const getIsQuestionAnswered = (
  answers: PersonalityTestQuestionAndScore[],
  questionId: string,
) => {
  return answers.find((answer) => answer.id === questionId);
};

const QuestionPageContainer = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const { mutate: patchPersonalityTestQuestion } =
    usePatchPersonalityTestQuestion();

  const { data: personalityTestScores } = useGetPersonalityTestScores();

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

  const { question, backendId, category } =
    PERSONALITY_TEST_QUESTIONS[currentQuestion];

  const isNextButtonDisabled =
    currentQuestion === PERSONALITY_TEST_QUESTIONS.length - 2;

  const selectedAnswer = getIsQuestionAnswered(
    personalityTestScores ? personalityTestScores[category] : [],
    backendId,
  );

  return (
    <QuestionPage
      question={question}
      currentQuestion={currentQuestion}
      isNextButtonDisabled={isNextButtonDisabled}
      selectedAnswer={selectedAnswer?.score}
      onOptionClick={handleOptionClick}
      onPreviousQuestionClick={handlePreviousQuestionClick}
      onNextQuestionClick={handleNextQuestionClick}
    />
  );
};

export default QuestionPageContainer;
