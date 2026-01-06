import PersonalityTestQuestion from "./PersonalityTestQuestion";
import NavigationButtons from "../common/NavigationButtons";
import { useState } from "react";
import { PERSONALITY_TEST_QUESTIONS } from "@/app/utils/utils";
import {
  PersonalityTestGetResponse,
  PersonalityTestQuestionAndScore,
  usePatchPersonalityTestQuestion,
} from "@/app/api/scores/scores";
import { useRouter } from "next/navigation";

type QuestionPageProps = {
  personalityTestScores: PersonalityTestGetResponse | undefined;
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

const COMPLETED_SCORE_QUESTION_COUNT = 50;

const getIsQuestionAnswered = (
  answers: PersonalityTestQuestionAndScore[],
  questionId: string,
) => {
  return answers.find((answer) => answer.id === questionId);
};

const QuestionPage = ({ personalityTestScores }: QuestionPageProps) => {
  const { mutate: patchPersonalityTestQuestion } =
    usePatchPersonalityTestQuestion();

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    getLatestQuestionIndex(personalityTestScores),
  );

  const router = useRouter();

  const handleOptionClick = (index: number, value: number) => {
    const questionAndAnswer = PERSONALITY_TEST_QUESTIONS[index];

    const isPersonalityTestCompleted =
      Object.values(personalityTestScores ?? {}).flatMap((entry) =>
        Array.isArray(entry) ? entry : [],
      ).length === COMPLETED_SCORE_QUESTION_COUNT;

    patchPersonalityTestQuestion({
      id: questionAndAnswer.backendId,
      category: questionAndAnswer.category,
      score: value,
    });

    if (isPersonalityTestCompleted) {
      router.push("/register");
      return;
    }
    if (index < PERSONALITY_TEST_QUESTIONS.length - 1) {
      setCurrentQuestion((prevState) => prevState + 1);
    }
  };

  const { question, backendId, category } =
    PERSONALITY_TEST_QUESTIONS[currentQuestion];

  const selectedAnswer = getIsQuestionAnswered(
    personalityTestScores ? personalityTestScores[category] : [],
    backendId,
  );

  const isNextButtonDisabled =
    currentQuestion === PERSONALITY_TEST_QUESTIONS.length - 2 ||
    !selectedAnswer;

  if (!personalityTestScores) {
    return null;
  }

  return (
    <PersonalityTestQuestion
      question={question}
      index={currentQuestion}
      onAnswer={handleOptionClick}
      selectedAnswer={selectedAnswer?.score}
      actions={
        <NavigationButtons
          onPrevButtonClick={() =>
            setCurrentQuestion((prev) => (prev > 0 ? prev - 1 : prev))
          }
          onNextButtonClick={() =>
            setCurrentQuestion((prev) =>
              prev < PERSONALITY_TEST_QUESTIONS.length - 1 ? prev + 1 : prev,
            )
          }
          isNextButtonDisabled={isNextButtonDisabled}
          isPrevButtonDisabled={currentQuestion === 0}
        />
      }
    />
  );
};

export default QuestionPage;
