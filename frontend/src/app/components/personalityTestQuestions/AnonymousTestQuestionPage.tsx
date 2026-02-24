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
import QuestionFormWrapper from "../generalQuestions/client/QuestionFormWrapper";

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

// const LAST_QUESTION_INDEX = PERSONALITY_TEST_QUESTIONS.length - 1;

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
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(() =>
    getLatestQuestionIndex(personalityTestScores),
  );

  const handleOptionClick = (value: number) => {
    if (value == null) {
      return;
    }
    const questionAndAnswer = PERSONALITY_TEST_QUESTIONS[currentQuestion];
    const userType = queryParams.get("type") as UserType;
    const isLastQuestion =
      currentQuestion === PERSONALITY_TEST_QUESTIONS.length - 1;

    if (!userType || !["patient", "therapist"].includes(userType)) {
      return;
    }

    // const isPersonalityTestCompleted = currentQuestion === LAST_QUESTION_INDEX;

    onAnswerQuestion({
      id: questionAndAnswer.backendId,
      category: questionAndAnswer.category,
      score: value,
    });

    // TODO: refactor to account for if the test has actually been completed
    if (isLastQuestion) {
      router.push(`/register?type=${userType}`);
      return;
    }

    setCurrentQuestion((prevState) => prevState + 1);
  };

  const { question, backendId, category } =
    PERSONALITY_TEST_QUESTIONS[currentQuestion];

  const selectedAnswer = getIsQuestionAnswered(
    personalityTestScores ? personalityTestScores[category] : [],
    backendId,
  );

  const isNextButtonDisabled =
    currentQuestion === PERSONALITY_TEST_QUESTIONS.length - 1 ||
    !selectedAnswer;

  if (!personalityTestScores) {
    return null;
  }

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
    </QuestionFormWrapper>
  );
};

export default AnonymousTestQuestionPage;
