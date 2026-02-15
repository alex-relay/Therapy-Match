"use client";

import FormGroup from "@mui/material/FormGroup";
import { useState, useContext } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { StyledFormControlLabel } from "@/app/components/common/OptionsContainers";
import NavigationButtons from "@/app/components/common/NavigationButtons";
import { useParams, useRouter } from "next/navigation";
import {
  TherapyNeedsOptions,
  TherapyNeedsOptionsMap,
  usePatchAnonymousQuestion,
} from "@/app/api/profile/profile";
import { getPreviousStep, AnonymousQuestionsStepName } from "@/app/utils/utils";
import { useNavContext } from "@/app/NavigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";
import { AnonymousPatientContext } from "./AnonymousPatientContext";

const TherapyNeeds = () => {
  const router = useRouter();
  const params = useParams();
  const { stepHistory, setStepHistory } = useNavContext();
  const { anonymousPatient } = useContext(AnonymousPatientContext);
  const step = params.step as AnonymousQuestionsStepName;

  const therapyNeedsValue = anonymousPatient?.therapy_needs ?? [];

  const [therapyNeeds, setTherapyNeeds] =
    useState<TherapyNeedsOptions[]>(therapyNeedsValue);

  const navigateToPersonalityTests = () => {
    if (!stepHistory.includes(step)) {
      setStepHistory((prevState) => [...prevState, step]);
    }
    router.push("/personality-tests/introduction?type=patient");
  };

  const { mutate: answerMutate } = usePatchAnonymousQuestion({
    onSuccess: () => {
      navigateToPersonalityTests();
    },
  });

  const handleOptionClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    isChecked: boolean,
  ) => {
    const option = event.target.value;

    setTherapyNeeds((prevState) => {
      if (isChecked) {
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

    if (
      !isStateMatchingSavedNeeds ||
      therapyNeeds.length !== therapyNeedsValue.length
    ) {
      answerMutate({ therapy_needs: therapyNeeds });
    } else {
      navigateToPersonalityTests();
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
          const previousStep = getPreviousStep(step, stepHistory);
          router.push(previousStep);
        }}
        isNextButtonDisabled={false}
        isPrevButtonDisabled={step === "gender"}
      />
    </QuestionFormWrapper>
  );
};

export default TherapyNeeds;
