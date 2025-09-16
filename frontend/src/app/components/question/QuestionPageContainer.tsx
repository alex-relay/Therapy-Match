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

  const { question } = PERSONALITY_TEST_QUESTIONS[currentQuestion];

  const showNextQuestionButton =
    currentQuestion <= PERSONALITY_TEST_QUESTIONS.length - 2;
  const showPreviousQuestionButton = currentQuestion > 0;

  console.log(questionAnswers);

  return (
    <PageContainer>
      <Question
        question={question}
        index={currentQuestion}
        onAnswer={(index: number, value: number) => {
          setQuestionAnswers((prevState) => {
            const questionAndAnswer = PERSONALITY_TEST_QUESTIONS[index];
            const isAnswerExists = !!prevState.find(
              (prevQuestion) => prevQuestion.question === question,
            );

            console.log({ isAnswerExists });

            if (isAnswerExists) {
              const otherAnswers = prevState.filter(
                (prevQuestion) => prevQuestion.question !== question,
              );
              console.log({ otherAnswers });
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
        }}
      />
      <Stack
        direction="row"
        maxWidth={"600px"}
        sx={{ minWidth: "600px", justifyContent: "space-between" }}
      >
        {showPreviousQuestionButton && (
          <Button onClick={handlePreviousQuestionClick}> Previous </Button>
        )}
        {showNextQuestionButton && (
          <Button onClick={handleNextQuestionClick}> Next </Button>
        )}
      </Stack>
    </PageContainer>
  );
};

export default QuestionPageContainer;
