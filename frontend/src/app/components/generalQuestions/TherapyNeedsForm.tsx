"use client";

import FormGroup from "@mui/material/FormGroup";
import { useState, useContext } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { StyledFormControlLabel } from "../common/OptionsContainers";
import NavigationButtons from "../common/NavigationButtons";
import { useParams, useRouter } from "next/navigation";
import {
  TherapyNeedsOptions,
  TherapyNeedsOptionsMap,
  usePatchQuestion,
} from "@/app/api/profile/profile";
import { getNextStep, PageName } from "@/app/utils/utils";
import { NavContext } from "@/app/navigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";
import { AnonymousPatientContext } from "./AnonymousPatientContext";

const TherapyNeeds = () => {
  const router = useRouter();
  const params = useParams();
  const { stepHistory, setStepHistory } = useContext(NavContext);
  const { anonymousPatient } = useContext(AnonymousPatientContext);
  const step = params.step as PageName;

  const therapyNeedsValue = anonymousPatient?.therapy_needs ?? [];

  const [therapyNeeds, setTherapyNeeds] =
    useState<TherapyNeedsOptions[]>(therapyNeedsValue);

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      const nextStep = getNextStep(step);

      if (stepHistory.indexOf(step) < 0) {
        setStepHistory((prevState) => [...prevState, step]);
      }
      router.push(`/questions/${nextStep}`);
    },
  });

  const handleOptionClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    const option = event.target.value;

    setTherapyNeeds((prevState) => {
      if (checked) {
        return prevState.filter((type) => type !== option);
      }
      return [...prevState, option as TherapyNeedsOptions];
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isStateMatchingSavedNeeds = therapyNeeds?.every(
      (need) => anonymousPatient?.therapy_needs?.includes(need),
    );

    if (!isStateMatchingSavedNeeds) {
      answerMutate({ therapy_needs: therapyNeeds });
    } else {
      const nextStep = getNextStep(step);

      if (stepHistory.includes(step)) {
        setStepHistory((prevState) => [...prevState, step]);
      }

      router.push(`/questions/${nextStep}`);
    }
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <FormGroup
        row
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {Object.entries(TherapyNeedsOptionsMap).map(([key, value]) => {
          const isChecked = therapyNeeds.includes(key as TherapyNeedsOptions);
          return (
            <Box
              width="300px"
              key={key}
              sx={{
                textAlign: "center",
              }}
            >
              <StyledFormControlLabel
                control={
                  <Checkbox
                    checked={isChecked}
                    value={key}
                    onChange={(event) => handleOptionClick(event, isChecked)}
                    name={key}
                    sx={{
                      display: "none",
                    }}
                  />
                }
                checked={isChecked}
                label={value}
              />
            </Box>
          );
        })}
      </FormGroup>
      <NavigationButtons
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
        isNextButtonDisabled={false}
        isPrevButtonDisabled={step === "gender"}
      />
    </QuestionFormWrapper>
  );
};

export default TherapyNeeds;
