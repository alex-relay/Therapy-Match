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

const OPTIONS_MAP = {
  male: "Male",
  female: "Female",
  non_binary: "Non-binary",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
} as const;

type GenderFormValues = keyof typeof OPTIONS_MAP | "";

export default function GenderForm({
  entity,
  step,
  nextStep,
  onAnswerMutate,
  stepHistory,
  previousStep,
}: AnonymousStepComponentProps) {
  const router = useRouter();

  const gender = entity?.gender ?? null;
  const [selectedValue, setSelectedValue] = useState<string | null>(gender);

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value as GenderFormValues);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedValue !== gender) {
      onAnswerMutate({ gender: selectedValue });
      return;
    }

    router.push(`/questions/${nextStep}`);
  };

  const handleIsChecked = (key: string) => {
    if (selectedValue) {
      return selectedValue === key;
    }

    return key === gender;
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <FormControl
        id="gender-question-label"
        sx={{
          margin: "auto",
          width: "80%",
          display: "block",
        }}
      >
        <RadioGroup
          aria-labelledby="gender-question-label"
          name="selectedGender"
          sx={{ gap: 2 }}
          onChange={handleRadioButtonChange}
        >
          {Object.entries(OPTIONS_MAP).map(([key, value]) => (
            <StyledFormControlLabel
              key={key}
              label={value}
              value={key}
              control={<StyledRadioButton />}
              checked={handleIsChecked(key)}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <NavigationButtons
        isNextButtonDisabled={!selectedValue && !gender}
        isPrevButtonDisabled={
          !stepHistory.length || stepHistory.indexOf(step) === 0
        }
        onPrevButtonClick={() => {
          router.push(previousStep);
        }}
      />
    </QuestionFormWrapper>
  );
}
