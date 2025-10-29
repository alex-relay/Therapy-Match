"use client";

import { useState } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "../common/OptionsContainers";
import { useParams, useRouter } from "next/navigation";
import { usePatchQuestion } from "../../api/profile/profile";
import { getNextStep, PageName } from "@/app/utils/utils";
import Box from "@mui/material/Box";

const OPTIONS_MAP = {
  jewish: "Jewish",
  muslim: "Muslim",
  hindu: "Hindu",
  buddhist: "Buddhist",
  christian: "Christian",
  sikh: "Sikh",
  not_applicable: "Not applicable",
  prefer_not_to_say: "Prefer not to say",
} as const;

type ReligionFormValues = keyof typeof OPTIONS_MAP;

export default function ReligionForm() {
  const [selectedValue, setSelectedValue] = useState<ReligionFormValues | null>(
    null,
  );
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
    setSelectedValue(event.target.value as ReligionFormValues);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedValue) {
      answerMutate({ religion: selectedValue });
    }
  };

  return (
    <Box
      display="flex"
      gap={2}
      sx={{ width: "80%", flexDirection: "column" }}
      component="form"
      onSubmit={handleSubmit}
    >
      <RadioGroup
        aria-labelledby="religion-question-label"
        name="selectedReligion"
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
    </Box>
  );
}
