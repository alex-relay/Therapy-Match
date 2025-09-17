"use client";
import {
  PERSONALITY_TEST_QUESTIONS,
  PersonalityTestQuestionAndAnswers,
} from "@/app/utils/utils";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import Question from "./Question";
import PageContainer from "../common/PageContainer";
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
    [theme.breakpoints.down("sm")]: {
      maxWidth: "400px",
      marginLeft: "25px",
      marginRight: "25px",
    },
  }));

  const StyledStack = styled(Stack)(({ theme }) => ({
    maxWidth: "800px",
    gap: "10px",
    [theme.breakpoints.up("sm")]: {
      margin: "25px",
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
    setCurrentQuestion((prevState) => prevState + 1);
  };

  const { question } = PERSONALITY_TEST_QUESTIONS[currentQuestion];

  return (
    <PageContainer>
      <StyledStack>
        <Question
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
            disabled={currentQuestion === PERSONALITY_TEST_QUESTIONS.length - 2}
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
      </StyledStack>
    </PageContainer>
  );
};

export default QuestionPageContainer;
