import PersonalityTestQuestion from "./PersonalityTestQuestion";
import NavigationButtons from "../common/NavigationButtons";

type QuestionPageProps = {
  question: string;
  currentQuestion: number;
  isNextButtonDisabled: boolean;
  selectedAnswer: number | undefined;
  onOptionClick: (index: number, value: number) => void;
  onPreviousQuestionClick: () => void;
  onNextQuestionClick: () => void;
};

const QuestionPage = ({
  question,
  currentQuestion,
  isNextButtonDisabled,
  selectedAnswer,
  onOptionClick,
  onPreviousQuestionClick,
  onNextQuestionClick,
}: QuestionPageProps) => (
  <PersonalityTestQuestion
    question={question}
    index={currentQuestion}
    onAnswer={onOptionClick}
    selectedAnswer={selectedAnswer}
    actions={
      <NavigationButtons
        onPrevButtonClick={onPreviousQuestionClick}
        onNextButtonClick={onNextQuestionClick}
        isNextButtonDisabled={isNextButtonDisabled}
        isPrevButtonDisabled={currentQuestion === 0}
      />
    }
  />
);

export default QuestionPage;
