"use client";

import { useParams } from "next/navigation";
import { THERAPIST_QUESTIONS_COMPONENT_MAP } from "@/app/components/generalQuestions/generalQuestions";
import { TherapistQuestionStepName } from "@/app/utils/utils";
import GeneralQuestion from "@/app/components/generalQuestions/GeneralQuestion";
import { useContext } from "react";
import { TherapistNavContext } from "@/app/contexts/TherapistNavigationContext";
import { useGetTherapistProfile } from "@/app/api/profile/profile";

const Questions = () => {
  const params = useParams();
  const step = params?.step as TherapistQuestionStepName;

  const { therapistProfileStepHistory, setTherapistProfileStepHistory } =
    useContext(TherapistNavContext);

  const { data: therapistProfile } = useGetTherapistProfile();

  if (!step || !THERAPIST_QUESTIONS_COMPONENT_MAP[step]) {
    return "Step is not available";
  }

  const FormComponent = THERAPIST_QUESTIONS_COMPONENT_MAP[step].component;
  const headerTitle = THERAPIST_QUESTIONS_COMPONENT_MAP[step].title;

  return (
    <GeneralQuestion headerTitle={headerTitle}>
      <FormComponent
        step={step}
        onStepHistoryChange={setTherapistProfileStepHistory}
        stepHistory={therapistProfileStepHistory}
        onAnswerMutate={() => {}}
        entity={therapistProfile ?? null}
        nextStep={step}
        previousStep=""
      />
    </GeneralQuestion>
  );
};

export default Questions;
