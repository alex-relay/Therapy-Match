"use client";

import FormGroup from "@mui/material/FormGroup";
import { useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { StyledFormControlLabel } from "@/app/components/common/OptionsContainers";
import NavigationButtons from "@/app/components/common/NavigationButtons";
import { useRouter } from "next/navigation";
import {
  TherapyNeedsOptions,
  TherapyNeedsOptionsMap,
  usePatchAnonymousQuestion,
} from "@/app/api/profile/profile";
import { AnonymousStepComponentProps } from "@/app/utils/utils";
import QuestionFormWrapper from "./QuestionFormWrapper";

const TherapyNeeds = ({
  step,
  stepHistory,
  previousStep,
  onStepHistoryChange,
  entity,
}: AnonymousStepComponentProps) => {
  const router = useRouter();

  const therapyNeedsValue = entity?.therapy_needs ?? [];

  const [therapyNeeds, setTherapyNeeds] =
    useState<TherapyNeedsOptions[]>(therapyNeedsValue);

  const navigateToPersonalityTests = () => {
    if (!stepHistory.includes(step)) {
      onStepHistoryChange((prevState) => [...prevState, step]);
    }
    router.push("/personality-tests/introduction?type=patient");
  };

  const { mutate: answerMutate } = usePatchAnonymousQuestion({
    options: {
      onSuccess: () => {
        navigateToPersonalityTests();
      },
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

    const isStateMatchingSavedNeeds = therapyNeeds.every((need) =>
      therapyNeedsValue.includes(need),
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

  const isPrevButtonDisabled =
    !stepHistory.length || stepHistory.indexOf(step) === 0;

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
          router.push(previousStep);
        }}
        isNextButtonDisabled={false}
        isPrevButtonDisabled={isPrevButtonDisabled}
      />
    </QuestionFormWrapper>
  );
};

export default TherapyNeeds;
