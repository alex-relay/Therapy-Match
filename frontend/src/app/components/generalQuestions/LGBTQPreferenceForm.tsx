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
import { usePatchQuestion } from "@/app/api/profile/profile";
import { getNextStep, PageName } from "@/app/utils/utils";
import { NavContext } from "@/app/navigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";
import { AnonymousPatientContext } from "./AnonymousPatientContext";
import { useQueryClient } from "@tanstack/react-query";

const LGBTQPreferenceForm = () => {
  const router = useRouter();
  const params = useParams();
  const { stepHistory, setStepHistory } = useContext(NavContext);
  const { anonymousPatient } = useContext(AnonymousPatientContext);
  const queryClient = useQueryClient();

  const lgbtqPreferenceValue =
    anonymousPatient?.is_lgbtq_therapist_preference ?? null;

  const [selectedValue, setSelectedValue] = useState<boolean | null>(
    lgbtqPreferenceValue,
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedValue !== anonymousPatient?.is_lgbtq_therapist_preference) {
      answerMutate({
        is_lgbtq_therapist_preference: selectedValue,
      });
    } else {
      const nextStep = getNextStep(step);

      if (stepHistory.indexOf(step) < 0) {
        setStepHistory((prevState) => [...prevState, step]);
      }

      router.push(`/questions/${nextStep}`);
    }
  };

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value === "yes" ? true : false);
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <FormControl component={"fieldset"} sx={{ gap: 2 }}>
        <RadioGroup
          name="lgbtqPreference"
          sx={{ gap: 2 }}
          onChange={handleRadioButtonChange}
        >
          <StyledFormControlLabel
            value={"yes"}
            label={"Yes"}
            control={<StyledRadioButton />}
            checked={selectedValue === true}
          />
          <StyledFormControlLabel
            value={"no"}
            label={"No"}
            control={<StyledRadioButton />}
            checked={selectedValue === false}
          />
        </RadioGroup>
        <NavigationButtons
          isNextButtonDisabled={!selectedValue}
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
      </FormControl>
    </QuestionFormWrapper>
  );
};

export default LGBTQPreferenceForm;
