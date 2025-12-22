"use client";

import {
  PERSONALITY_TEST_QUESTIONS,
  PersonalityTestQuestionAndAnswers,
} from "@/app/utils/utils";
import { useState } from "react";
import QuestionPage from "./QuestionPage";

const QuestionPageContainer = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<
    PersonalityTestQuestionAndAnswers[]
  >([]);

  const handlePreviousQuestionClick = () => {
    setCurrentQuestion((prevState) => prevState - 1);
  };

  const handleNextQuestionClick = () => {
    setCurrentQuestion((prevState) => prevState + 1);
  };

  const handleOptionClick = (index: number, value: number) => {
    setQuestionAnswers((prevState) => {
      const questionAndAnswer = PERSONALITY_TEST_QUESTIONS[index];
      const isAnswerExists = !!prevState.find(
        (prevQuestion) => prevQuestion.question === question,
      );

      if (isAnswerExists) {
        const otherAnswers = prevState.filter(
          (prevQuestion) => prevQuestion.question !== question,
        );
        return [
          ...otherAnswers,
          {
            ...questionAndAnswer,
            answer: value,
          },
        ];
      }
      return [
        ...prevState,
        {
          ...questionAndAnswer,
          answer: value,
        },
      ];
    });
    if (currentQuestion < PERSONALITY_TEST_QUESTIONS.length - 1) {
      setCurrentQuestion((prevState) => prevState + 1);
    }
  };

  const { question } = PERSONALITY_TEST_QUESTIONS[currentQuestion];

  const isNextButtonDisabled =
    currentQuestion === PERSONALITY_TEST_QUESTIONS.length - 2 ||
    questionAnswers.length === currentQuestion;

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
