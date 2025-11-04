"use client";

import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "../common/OptionsContainers";
import { useState, useContext } from "react";
import NavigationButtons from "../common/NavigationButtons";
import { useParams, useRouter } from "next/navigation";
import Stack from "@mui/material/Stack";
import { usePatchQuestion } from "@/app/api/profile/profile";
import { getNextStep, PageName } from "@/app/utils/utils";
import { NavContext } from "@/app/navigationContext";

type LGBTQPreferenceOptions = "yes" | "no";

const LGBTQPreferenceForm = () => {
  const [selectedValue, setSelectedValue] =
    useState<LGBTQPreferenceOptions | null>(null);

  const router = useRouter();
  const params = useParams();
  const { history, setHistory } = useContext(NavContext);

  const step = params.step as PageName;

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      const nextStep = getNextStep(step);
      router.push(`/questions/${nextStep}`);
      setHistory((prevState) => [...prevState, step]);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    answerMutate({
      is_religious_therapist_preference: selectedValue === "yes" ? true : false,
    });
  };

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value as LGBTQPreferenceOptions);
  };

  return (
    <Stack component="form" onSubmit={handleSubmit}>
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
            checked={selectedValue === "no"}
          />
        </RadioGroup>
        <NavigationButtons
          isNextButtonDisabled={!selectedValue}
          onPrevButtonClick={() => {
            if (!history.length) {
              router.push(`/`);
              return;
            }

            router.push(`/questions/${history[history.length - 1]}`);

            setHistory((prevState) =>
              prevState.filter((_, i) => i < prevState.length - 1),
            );
          }}
        />
      </FormControl>
    </Stack>
  );
};

export default LGBTQPreferenceForm;
