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
import { usePatchTherapistProfile } from "@/app/api/profile/profile";

export default function ReligiousSpecializationForm({
  entity,
  previousStep,
}: TherapistStepComponentProps) {
  const router = useRouter();

  const entityReligiousSpecialization = entity.is_religious_specialization;

  const [selectedPreference, setSelectedPreference] = useState<boolean | null>(
    entityReligiousSpecialization,
  );

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedPreference(event.target.value === "yes");
  };

  const { mutate: patchTherapistProfile } = usePatchTherapistProfile({
    onSuccess: () => {
      router.push(`/therapist/dashboard`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedPreference !== entityReligiousSpecialization) {
      patchTherapistProfile({
        is_religious_specialization: selectedPreference,
      });
      return;
    }

    router.push(`/therapist/dashboard`);
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <FormControl
        id="religious-specialization-question-label"
        sx={{
          margin: "auto",
          width: "80%",
          display: "block",
        }}
      >
        <RadioGroup
          aria-labelledby="religious-specialization-question-label"
          name="religiousPreference"
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
