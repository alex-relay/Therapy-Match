"use client";

import { useParams, useRouter } from "next/navigation";
import { ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP } from "@/app/components/generalQuestions/generalQuestions";
import {
  AnonymousQuestionsStepName,
  getAnonymousSessionNextStep,
  getPreviousAnonymousStep,
} from "@/app/utils/utils";
import GeneralQuestion from "@/app/components/generalQuestions/GeneralQuestion";
import { useNavContext } from "@/app/contexts/NavigationContext";
import {
  useGetAnonymousPatientSession,
  usePatchAnonymousQuestion,
} from "@/app/api/profile/profile";

const Questions = () => {
  const params = useParams();
  const router = useRouter();
  const step = params.step as AnonymousQuestionsStepName;

  const { stepHistory, setStepHistory } = useNavContext();
  const nextStep = getAnonymousSessionNextStep(step);

  // TODO: remove this context and just use the hook directly here.
  const { data: anonymousPatient, isLoading: isAnonymousPatientLoading } =
    useGetAnonymousPatientSession();

  const { mutate: answerMutate } = usePatchAnonymousQuestion({
    options: {
      onSuccess: () => {
        if (!stepHistory?.includes(step)) {
          setStepHistory((prevState) => [...prevState, step]);
        }
        router.push(`/questions/${nextStep}`);
      },
    },
  });

  if (!step || !ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP[step]) {
    return "Step does not exist";
  }

  if (!anonymousPatient || isAnonymousPatientLoading) {
    return null;
  }

  const FormComponent =
    ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP[step].component;
  const headerTitle =
    ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP[step].title;

  return (
    <GeneralQuestion headerTitle={headerTitle}>
      <FormComponent
        entity={anonymousPatient}
        stepHistory={stepHistory}
        nextStep={nextStep}
        onStepHistoryChange={setStepHistory}
        onAnswerMutate={answerMutate}
        step={step}
        previousStep={getPreviousAnonymousStep(step, stepHistory)}
      />
    </GeneralQuestion>
  );
};

export default Questions;
