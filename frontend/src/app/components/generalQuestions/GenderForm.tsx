"use client";

import { useState } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import { StyledFormControlLabel, StyledRadioButton } from "./OptionsContainers";
import { useParams, useRouter } from "next/navigation";
import { usePatchQuestion } from "../../api/profile/profile";

const OPTIONS_MAP = {
  male: "Male",
  female: "Female",
  non_binary: "Non-binary",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
} as const;

type GenderFormValues = keyof typeof OPTIONS_MAP | "";

export default function GenderForm() {
  const [selectedValue, setSelectedValue] = useState<GenderFormValues>("");
  const router = useRouter();
  const params = useParams();
  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      router.push(`/questions/${parseInt(step) + 1}`);
    },
  });

  const step = params.step as string;

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value as GenderFormValues);
    answerMutate({ gender: event.target.value });
  };

  return (
    <FormControl
      id="gender-question-label"
      component="fieldset"
      sx={{ width: "80%" }}
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
            checked={selectedValue === key}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
