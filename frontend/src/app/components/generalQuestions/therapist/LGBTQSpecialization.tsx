"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NavigationButtons from "../../common/NavigationButtons";
import { TherapistStepComponentProps } from "@/app/utils/utils";
import QuestionFormWrapper from "../client/QuestionFormWrapper";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "@/app/components/common/OptionsContainers";

export default function LGBTQSpecializationForm({
  nextStep,
  onAnswerMutate,
  entity: { is_lgbtq_specialization },
  previousStep,
}: TherapistStepComponentProps) {
  const router = useRouter();

  const [selectedPreference, setSelectedPreference] = useState<boolean | null>(
    is_lgbtq_specialization,
  );

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedPreference(event.target.value === "yes");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedPreference !== is_lgbtq_specialization) {
      onAnswerMutate({ is_lgbtq_specialization: selectedPreference });
      return;
    }

    router.push(nextStep);
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <FormControl
        id="lgbtq-specialization-question-label"
        sx={{
          margin: "auto",
          width: "80%",
          display: "block",
        }}
      >
        <RadioGroup
          aria-labelledby="lgbtq-specialization-question-label"
          name="lgbtqPreference"
          sx={{ gap: 2 }}
          onChange={handleRadioButtonChange}
        >
          <StyledFormControlLabel
            value="yes"
            label="Yes"
            control={<StyledRadioButton />}
            checked={selectedPreference === true}
          />
          <StyledFormControlLabel
            value="no"
            label="No"
            control={<StyledRadioButton />}
            checked={selectedPreference === false}
          />
        </RadioGroup>
      </FormControl>
      <NavigationButtons
        isNextButtonDisabled={selectedPreference === null}
        onPrevButtonClick={() => {
          router.push(previousStep);
        }}
      />
    </QuestionFormWrapper>
  );
}
