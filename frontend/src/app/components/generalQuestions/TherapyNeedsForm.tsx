"use client";

import FormGroup from "@mui/material/FormGroup";
import { useState, useContext } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { StyledFormControlLabel } from "../common/OptionsContainers";
import NavigationButtons from "../common/NavigationButtons";
import { useParams, useRouter } from "next/navigation";
import { usePatchQuestion } from "@/app/api/profile/profile";
import { getNextStep, PageName } from "@/app/utils/utils";
import { NavContext } from "@/app/navigationContext";

const TherapyNeedsOptionsMap = {
  anxiety: "Anxiety",
  depression: "Depression",
  trauma_ptsd: "Trauma and PTSD",
  relationships: "Relationship problems",
  life_transitions: "Major life transitions",
  grief: "Grief and loss",
  substance_abuse: "Substance abuse and addiction",
  self_esteem: "Low self-esteem",
  stress: "Stress",
  coping_mechanisms: "Unhealthy coping mechanisms",
  eating_disorders: "Eating disorder",
  anger_management: "Anger management",
  adhd: "ADHD",
  insomnia: "Insomnia",
  mood_disorders: "Depression/Mood disorders",
  personality_disorders: "Personality Disorders",
  attention_focus: "Attention and focus issues",
} as const;

type TherapyNeedsOptions = keyof typeof TherapyNeedsOptionsMap;

const TherapyNeeds = () => {
  const [therapyNeeds, setTherapyNeeds] = useState<TherapyNeedsOptions[]>([]);
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

  const handleNextButtonClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    answerMutate({ therapy_needs: therapyNeeds });
  };

  return (
    <Box
      display="flex"
      gap={2}
      sx={{ width: "100%", flexDirection: "column" }}
      component="form"
      onSubmit={handleNextButtonClick}
    >
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
    </Box>
  );
};

export default TherapyNeeds;
