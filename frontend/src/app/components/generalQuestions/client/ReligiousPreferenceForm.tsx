"use client";

import { useState } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "@/app/components/common/OptionsContainers";
import { useRouter } from "next/navigation";
import { usePatchAnonymousQuestion } from "@/app/api/profile/profile";
import { AnonymousStepComponentProps } from "@/app/utils/utils";
import NavigationButtons from "@/app/components/common/NavigationButtons";
import QuestionFormWrapper from "./QuestionFormWrapper";

export default function ReligiousPreferenceForm({
  nextStep,
  step,
  stepHistory,
  onStepHistoryChange,
  entity,
  previousStep,
}: AnonymousStepComponentProps) {
  const router = useRouter();

  const religiousPreferenceValue =
    entity?.is_religious_therapist_preference ?? null;
  const [selectedValue, setSelectedValue] = useState<boolean | null>(
    religiousPreferenceValue,
  );

  console.log({ stepHistory });

  const isStepInStepHistory = stepHistory.indexOf(step) >= 0;

  const { mutate: answerMutate } = usePatchAnonymousQuestion({
    onSuccess: () => {
      if (!isStepInStepHistory) {
        onStepHistoryChange((prevState) => [...prevState, step]);
      }

      router.push(`/questions/${nextStep}`);
    },
  });

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value === "yes" ? true : false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedValue !== religiousPreferenceValue) {
      answerMutate({ is_religious_therapist_preference: selectedValue });
    } else {
      if (!isStepInStepHistory) {
        onStepHistoryChange((prevState) => [...prevState, step]);
      }

      router.push(`/questions/${nextStep}`);
    }
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <FormControl
        id="religious-preference-question-label"
        sx={{
          margin: "auto",
          width: "80%",
          display: "block",
        }}
      >
        <RadioGroup
          aria-labelledby="religious-preference-question-label"
          name="religiousPreference"
          sx={{ gap: 2 }}
          onChange={handleRadioButtonChange}
        >
          <StyledFormControlLabel
            key="yes"
            value="yes"
            label="Yes"
            control={<StyledRadioButton />}
            checked={selectedValue === true}
          />
          <StyledFormControlLabel
            key="no"
            value="no"
            label="No"
            control={<StyledRadioButton />}
            checked={selectedValue === false}
          />
        </RadioGroup>
      </FormControl>
      <NavigationButtons
        isNextButtonDisabled={selectedValue === null}
        onPrevButtonClick={() => {
          router.push(previousStep);
        }}
      />
    </QuestionFormWrapper>
  );
}
