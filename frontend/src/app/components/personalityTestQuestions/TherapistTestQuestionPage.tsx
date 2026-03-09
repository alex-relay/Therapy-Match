import PersonalityTestQuestion from "./PersonalityTestQuestion";
import { useState } from "react";
import { PERSONALITY_TEST_QUESTIONS } from "@/app/utils/utils";
import {
  PersonalityTestGetResponse,
  PersonalityTestQuestionAndScore,
} from "@/app/api/scores/scores";
import { useRouter } from "next/navigation";
import QuestionFormWrapper from "../generalQuestions/client/QuestionFormWrapper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

type QuestionPageProps = {
  personalityTestScores: PersonalityTestGetResponse | undefined;
  onAnswerQuestion: (score: PersonalityTestQuestionAndScore) => void;
};

const getLatestQuestionIndex = (
  personalityTestScores: PersonalityTestGetResponse | undefined,
) => {
  const personalityTestScoreValues = Object.values(personalityTestScores ?? {})
    .filter((val) => Array.isArray(val))
    .flat();

  if (personalityTestScoreValues.length === 0) {
    return 0;
  }

  return personalityTestScoreValues.length - 1;
};

const findQuestionAnswered = (
  answers: PersonalityTestQuestionAndScore[],
  questionId: string,
) => {
  return answers.find((answer) => answer.id === questionId);
};

const TherapistTestQuestionPage = ({
  personalityTestScores,
  onAnswerQuestion,
}: QuestionPageProps) => {
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    getLatestQuestionIndex(personalityTestScores),
  );

  const handleOptionClick = (value: number) => {
    if (value == null) {
      return;
    }

    const questionAndAnswer = PERSONALITY_TEST_QUESTIONS[currentQuestion];
    const isLastQuestion =
      currentQuestion === PERSONALITY_TEST_QUESTIONS.length - 1;

    onAnswerQuestion({
      id: questionAndAnswer.backendId,
      category: questionAndAnswer.category,
      score: value,
    });

    if (isLastQuestion) {
      router.push("/therapist/dashboard");
      return;
    }
    setCurrentQuestion((prevState) => prevState + 1);
  };

  const { question, backendId, category } =
    PERSONALITY_TEST_QUESTIONS[currentQuestion];

  const selectedAnswer = findQuestionAnswered(
    personalityTestScores ? personalityTestScores[category] : [],
    backendId,
  );

  const isNextButtonDisabled =
    currentQuestion === PERSONALITY_TEST_QUESTIONS.length - 1 ||
    !selectedAnswer;

  if (!personalityTestScores) {
    return null;
  }
  // TODO: refactor this entire form to use Radio buttons for better accessibility and performance.
  // This will also simplify the form handling logic significantly.
  return (
    <QuestionFormWrapper
      handleSubmit={(e) => {
        e.preventDefault();
        const submitter = (e.nativeEvent as SubmitEvent).submitter;
        const data = new FormData(e.currentTarget, submitter);
        const value = data.get("score");

        handleOptionClick(Number(value));
      }}
    >
      <PersonalityTestQuestion
        question={question}
        index={currentQuestion}
        onAnswer={handleOptionClick}
        selectedAnswer={selectedAnswer?.score}
        actions={
          <Stack direction="row" width="100%" justifyContent="space-between">
            <Button
              onClick={() =>
                setCurrentQuestion((prev) => (prev > 0 ? prev - 1 : prev))
              }
              disabled={currentQuestion === 0}
              variant="outlined"
              type="button"
              sx={{
                width: "100px",
              }}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              disabled={isNextButtonDisabled}
              sx={{
                width: "100px",
              }}
              onClick={() =>
                setCurrentQuestion((prev) =>
                  prev < PERSONALITY_TEST_QUESTIONS.length - 1
                    ? prev + 1
                    : prev,
                )
              }
            >
              Next
            </Button>
          </Stack>
        }
      />
    </QuestionFormWrapper>
  );
};

export default TherapistTestQuestionPage;
