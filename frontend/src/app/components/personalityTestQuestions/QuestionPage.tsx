"use client";

import {
  PERSONALITY_TEST_QUESTIONS,
  PersonalityTestQuestionAndAnswers,
} from "@/app/utils/utils";
import { useState } from "react";
import PersonalityTestQuestion from "./PersonalityTestQuestion";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

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

  const StyledBox = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "400px",
      marginLeft: "25px",
      marginRight: "25px",
    },
  }));

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
    <>
      <PersonalityTestQuestion
        question={question}
        index={currentQuestion}
        onAnswer={handleOptionClick}
      />
      <StyledBox>
        <Button
          disabled={currentQuestion === 0}
          onClick={handlePreviousQuestionClick}
          sx={{ minWidth: "100px", backgroundColor: "white" }}
        >
          {" "}
          Previous{" "}
        </Button>
        <Button
          disabled={isNextButtonDisabled}
          onClick={handleNextQuestionClick}
          sx={{
            backgroundColor: "white",
            minWidth: "100px",
          }}
        >
          {" "}
          Next{" "}
        </Button>
      </StyledBox>
    </>
  );
};

export default QuestionPageContainer;
