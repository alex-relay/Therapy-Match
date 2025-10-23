import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "../common/OptionsContainers";
import { useState } from "react";

type LGBTQPreferenceOptions = "yes" | "no" | "prefer_not_to_say";

const LGBTQPreferenceForm = () => {
  const [selectedValue, setSelectedValue] =
    useState<LGBTQPreferenceOptions | null>(null);

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value as LGBTQPreferenceOptions);
  };

  return (
    <FormControl component={"fieldset"}>
      <RadioGroup
        name="lgbtqPreference"
        sx={{ gap: 2 }}
        onChange={handleRadioButtonChange}
      >
        <StyledFormControlLabel
          value={"yes"}
          label={"Yes"}
          control={<StyledRadioButton />}
          checked={selectedValue === "yes"}
        />
        <StyledFormControlLabel
          value={"no"}
          label={"No"}
          control={<StyledRadioButton />}
          checked={selectedValue === "yes"}
        />
        <StyledFormControlLabel
          value={"prefer_not_to_say"}
          label={"Prefer not to say"}
          control={<StyledRadioButton />}
          checked={selectedValue === "yes"}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default LGBTQPreferenceForm;
