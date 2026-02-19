"use client";

import { useParams } from "next/navigation";
import { THERAPIST_QUESTIONS_COMPONENT_MAP } from "@/app/components/generalQuestions/generalQuestions";
import { TherapistQuestionStepName } from "@/app/utils/utils";
import GeneralQuestion from "@/app/components/generalQuestions/GeneralQuestion";

const Questions = () => {
  const params = useParams();
  const step = params?.step as TherapistQuestionStepName;

  if (!step || !THERAPIST_QUESTIONS_COMPONENT_MAP[step]) {
    return "Step is not available";
  }

  const FormComponent = THERAPIST_QUESTIONS_COMPONENT_MAP[step].component;
  const headerTitle = THERAPIST_QUESTIONS_COMPONENT_MAP[step].title;

  return (
    <GeneralQuestion headerTitle={headerTitle}>
      <FormComponent />
    </GeneralQuestion>
  );
};

export default Questions;
