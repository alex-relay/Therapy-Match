"use client";

import { useState } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import { StyledFormControlLabel, StyledRadioButton } from "./OptionsContainers";
import { useTheme } from "@mui/material/styles";
import { useParams, useRouter } from "next/navigation";

const OPTIONS_MAP = {
  male: "Male",
  female: "Female",
  non_binary: "Non-binary",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

type GenderFormValues = keyof typeof OPTIONS_MAP | "";

export default function GenderForm() {
  const [selectedValue, setSelectedValue] = useState<GenderFormValues>("");
  const router = useRouter();
  const params = useParams();
  const theme = useTheme();

  const step = params.step as string;

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value as GenderFormValues);
    router.push(`/questions/${parseInt(step) + 1}`);
  };

  return (
    <FormControl sx={{ width: "80%" }}>
      <RadioGroup
        aria-labelledby="gender-question-label"
        name="gender-question-label"
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
            sx={
              selectedValue === key
                ? { backgroundColor: theme.palette.primary.main }
                : {}
            }
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
