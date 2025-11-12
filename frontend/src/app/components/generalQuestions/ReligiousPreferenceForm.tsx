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
import { useNavContext } from "@/app/NavigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";
import { AnonymousPatientContext } from "./AnonymousPatientContext";
import { useQueryClient } from "@tanstack/react-query";

export default function ReligiousPreferenceForm() {
  const router = useRouter();
  const params = useParams();
  const { stepHistory, setStepHistory, goToPreviousStep } = useNavContext();
  const { anonymousPatient } = useContext(AnonymousPatientContext);
  const queryClient = useQueryClient();

  const religiousPreferenceValue =
    anonymousPatient?.is_religious_therapist_preference ?? null;

  const [selectedValue, setSelectedValue] = useState<boolean | null>(
    religiousPreferenceValue,
  );

  const step = params.step as PageName;

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      const nextStep = getNextStep(step);

      if (stepHistory.indexOf(step) < 0) {
        setStepHistory((prevState) => [...prevState, step]);
      }
      queryClient.invalidateQueries({ queryKey: ["anonymousPatientSession"] });
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

    if (selectedValue !== anonymousPatient?.is_religious_therapist_preference) {
      answerMutate({ is_religious_therapist_preference: selectedValue });
    } else {
      const nextStep = getNextStep(step);

      if (stepHistory.indexOf(step) < 0) {
        setStepHistory((prevState) => [...prevState, step]);
      }

      router.push(`/questions/${nextStep}`);
    }
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
            checked={selectedValue === true}
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
        onPrevButtonClick={() => goToPreviousStep(step)}
      />
    </QuestionFormWrapper>
  );
}
