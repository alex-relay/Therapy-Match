"use client";

import { useState } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "@/app/components/common/OptionsContainers";
import { useRouter } from "next/navigation";
import { AnonymousStepComponentProps } from "@/app/utils/utils";
import NavigationButtons from "@/app/components/common/NavigationButtons";
import QuestionFormWrapper from "./QuestionFormWrapper";

export default function ReligiousPreferenceForm({
  nextStep,
  onAnswerMutate,
  entity,
  previousStep,
}: AnonymousStepComponentProps) {
  const router = useRouter();

  const religiousPreferenceValue =
    entity?.is_religious_therapist_preference ?? null;
  const [selectedValue, setSelectedValue] = useState<boolean | null>(
    religiousPreferenceValue,
  );

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value === "yes" ? true : false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedValue !== religiousPreferenceValue) {
      onAnswerMutate({ is_religious_therapist_preference: selectedValue });
      return;
    }

    router.push(`/questions/${nextStep}`);
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
