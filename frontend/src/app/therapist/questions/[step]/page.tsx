"use client";

import { useParams, useRouter } from "next/navigation";
import { THERAPIST_QUESTIONS_COMPONENT_MAP } from "@/app/components/generalQuestions/generalQuestions";
import {
  getPreviousTherapistProfileStep,
  TherapistQuestionStepName,
} from "@/app/utils/utils";
import GeneralQuestion from "@/app/components/generalQuestions/GeneralQuestion";
import { useContext } from "react";
import { TherapistNavContext } from "@/app/contexts/TherapistNavigationContext";
import {
  useGetTherapistProfile,
  usePatchTherapistProfile,
} from "@/app/api/profile/profile";

const Questions = () => {
  const params = useParams();
  const step = params?.step as TherapistQuestionStepName;
  const router = useRouter();
  const { therapistProfileStepHistory, setTherapistProfileStepHistory } =
    useContext(TherapistNavContext);

  const { data: therapistProfile } = useGetTherapistProfile();

  if (!step || !THERAPIST_QUESTIONS_COMPONENT_MAP[step]) {
    return "Step is not available";
  }

  const nextStep = THERAPIST_QUESTIONS_COMPONENT_MAP[step].getNextStep();

  const { mutate: patchTherapistProfile } = usePatchTherapistProfile({
    onSuccess: () => {
      if (!therapistProfileStepHistory?.includes(step)) {
        setTherapistProfileStepHistory((prevState) => [...prevState, step]);
      }
      router.push(nextStep);
    },
  });

  if (!therapistProfile) {
    return null;
  }

  const FormComponent = THERAPIST_QUESTIONS_COMPONENT_MAP[step].component;
  const headerTitle = THERAPIST_QUESTIONS_COMPONENT_MAP[step].title;

  return (
    <GeneralQuestion headerTitle={headerTitle}>
      <FormComponent
        step={step}
        onStepHistoryChange={setTherapistProfileStepHistory}
        stepHistory={therapistProfileStepHistory}
        onAnswerMutate={patchTherapistProfile}
        entity={therapistProfile}
        nextStep={nextStep}
        previousStep={getPreviousTherapistProfileStep(
          step,
          therapistProfileStepHistory,
        )}
      />
    </GeneralQuestion>
  );
};

export default Questions;
