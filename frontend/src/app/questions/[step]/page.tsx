"use client";

import { useParams } from "next/navigation";
import { ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP } from "@/app/components/generalQuestions/generalQuestions";
import {
  AnonymousQuestionsStepName,
  getAnonymousSessionNextStep,
  getPreviousAnonymousStep,
} from "@/app/utils/utils";
import GeneralQuestion from "@/app/components/generalQuestions/GeneralQuestion";
import { useNavContext } from "@/app/NavigationContext";
import { useContext } from "react";
import { AnonymousPatientContext } from "@/app/components/generalQuestions/client/AnonymousPatientContext";

const Questions = () => {
  const params = useParams();
  const step = params.step as AnonymousQuestionsStepName;

  const { stepHistory, setStepHistory } = useNavContext();
  const nextStep = getAnonymousSessionNextStep(step);

  const { anonymousPatient } = useContext(AnonymousPatientContext);

  if (!step || !ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP[step]) {
    return "Step does not exist";
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
        step={step}
        previousStep={getPreviousAnonymousStep(step, stepHistory)}
      />
    </GeneralQuestion>
  );
};

export default Questions;
