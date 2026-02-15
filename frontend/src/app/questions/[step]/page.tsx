"use client";

import { useParams } from "next/navigation";
import { ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP } from "@/app/components/generalQuestions/generalQuestions";
import { AnonymousQuestionsStepName } from "@/app/utils/utils";
import GeneralQuestion from "@/app/components/generalQuestions/GeneralQuestion";

const Questions = () => {
  const params = useParams();
  const step = params.step as AnonymousQuestionsStepName;

  if (!step || !ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP[step]) {
    return "Step does not exist";
  }

  const FormComponent =
    ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP[step].component;
  const headerTitle =
    ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP[step].title;

  return (
    <GeneralQuestion headerTitle={headerTitle}>
      <FormComponent />
    </GeneralQuestion>
  );
};

export default Questions;
