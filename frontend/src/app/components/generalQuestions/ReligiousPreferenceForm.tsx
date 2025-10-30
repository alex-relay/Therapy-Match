"use client";

import { useState } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "../common/OptionsContainers";
import { useParams, useRouter } from "next/navigation";
import { usePatchQuestion } from "../../api/profile/profile";
import { getNextStep, PageName } from "@/app/utils/utils";
import NavigationButtons from "../common/NavigationButtons";
import Stack from "@mui/material/Stack";

export default function ReligiousPreferenceForm() {
  const [selectedValue, setSelectedValue] = useState<boolean | null>(null);
  const router = useRouter();
  const params = useParams();
  const step = params.step as PageName;

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      const nextStep = getNextStep(step);
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
    answerMutate({ is_religious_therapist_preference: selectedValue });
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      width="100%"
      sx={{ gap: 2 }}
    >
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
            checked={!!selectedValue}
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
          router.push(`/questions/religion`);
        }}
      />
    </Stack>
  );
}
