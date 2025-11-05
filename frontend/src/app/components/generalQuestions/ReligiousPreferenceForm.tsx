"use client";

import { useState, useContext } from "react";
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
import { NavContext } from "@/app/navigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";

export default function ReligiousPreferenceForm() {
  const [selectedValue, setSelectedValue] = useState<boolean | null>(null);
  const router = useRouter();
  const params = useParams();
  const { stepHistory, setStepHistory } = useContext(NavContext);
  const step = params.step as PageName;

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      const nextStep = getNextStep(step);

      if (stepHistory.indexOf(step) < 0) {
        setStepHistory((prevState) => [...prevState, step]);
      }
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
    <QuestionFormWrapper handleSubmit={handleSubmit}>
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
          if (!history.length) {
            router.push(`/`);
            return;
          }

          const stepInHistory = stepHistory.indexOf(step);

          const previousStep =
            stepInHistory >= 0
              ? stepHistory[stepInHistory - 1]
              : stepHistory[stepHistory.length - 1];

          router.push(`/questions/${previousStep}`);
        }}
      />
    </QuestionFormWrapper>
  );
}
