"use client";

import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "@/app/components/common/OptionsContainers";
import { useState } from "react";
import NavigationButtons from "@/app/components/common/NavigationButtons";
import { useRouter } from "next/navigation";
import { AnonymousStepComponentProps } from "@/app/utils/utils";
import QuestionFormWrapper from "./QuestionFormWrapper";

const LGBTQPreferenceForm = ({
  previousStep,
  nextStep,
  stepHistory,
  step,
  onAnswerMutate,
  entity,
}: AnonymousStepComponentProps) => {
  const router = useRouter();

  const lgbtqPreferenceValue = entity?.is_lgbtq_therapist_preference ?? null;

  const [selectedValue, setSelectedValue] = useState<boolean | null>(
    lgbtqPreferenceValue,
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedValue !== lgbtqPreferenceValue) {
      onAnswerMutate({
        is_lgbtq_therapist_preference: selectedValue,
      });
      return;
    }
    router.push(`/questions/${nextStep}`);
  };

  const isPrevButtonDisabled =
    !stepHistory.length || stepHistory.indexOf(step) === 0;

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value === "yes");
  };

  return (
    <QuestionFormWrapper
      handleSubmit={handleSubmit}
      wrapperSx={{ alignItems: "center" }}
    >
      <FormControl component={"fieldset"} sx={{ gap: 2, width: "80%" }}>
        <RadioGroup
          name="lgbtqPreference"
          sx={{ gap: 2 }}
          onChange={handleRadioButtonChange}
        >
          <StyledFormControlLabel
            value={"yes"}
            label={"Yes"}
            control={<StyledRadioButton />}
            checked={selectedValue === true}
          />
          <StyledFormControlLabel
            value={"no"}
            label={"No"}
            control={<StyledRadioButton />}
            checked={selectedValue === false}
          />
        </RadioGroup>
      </FormControl>
      <NavigationButtons
        isNextButtonDisabled={selectedValue === null}
        isPrevButtonDisabled={isPrevButtonDisabled}
        onPrevButtonClick={() => {
          router.push(previousStep);
        }}
      />
    </QuestionFormWrapper>
  );
};

export default LGBTQPreferenceForm;
