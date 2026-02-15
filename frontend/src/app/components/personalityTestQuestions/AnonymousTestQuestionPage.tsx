import PersonalityTestQuestion from "./PersonalityTestQuestion";
import NavigationButtons from "../common/NavigationButtons";
import { useState } from "react";
import { PERSONALITY_TEST_QUESTIONS } from "@/app/utils/utils";
import {
  PersonalityTestGetResponse,
  PersonalityTestQuestionAndScore,
} from "@/app/api/scores/scores";
import { useRouter, useSearchParams } from "next/navigation";
import { UserType } from "@/app/api/users/users";

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

const LAST_QUESTION_INDEX = PERSONALITY_TEST_QUESTIONS.length - 1;

const getIsQuestionAnswered = (
  answers: PersonalityTestQuestionAndScore[],
  questionId: string,
) => {
  return answers.find((answer) => answer.id === questionId);
};

const AnonymousTestQuestionPage = ({
  personalityTestScores,
  onAnswerQuestion,
}: QuestionPageProps) => {
  const queryParams = useSearchParams();

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    getLatestQuestionIndex(personalityTestScores),
  );

  const router = useRouter();

  const handleOptionClick = (index: number, value: number) => {
    const questionAndAnswer = PERSONALITY_TEST_QUESTIONS[index];
    const userType = queryParams.get("type") as UserType;
    const isLastQuestion = index === PERSONALITY_TEST_QUESTIONS.length - 1;

    if (!userType || !["patient", "therapist"].includes(userType)) {
      return;
    }

    const isPersonalityTestCompleted = index === LAST_QUESTION_INDEX;

    onAnswerQuestion({
      id: questionAndAnswer.backendId,
      category: questionAndAnswer.category,
      score: value,
    });

    if (isPersonalityTestCompleted) {
      router.push(`/register?type=${userType}`);
      return;
    }

    if (!isLastQuestion) {
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

export default AnonymousTestQuestionPage;
