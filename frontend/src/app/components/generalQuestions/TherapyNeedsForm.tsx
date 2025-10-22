"use client";

import FormGroup from "@mui/material/FormGroup";
import FormControl from "@mui/material/FormControl";
import { useState } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import { StyledFormControlLabel } from "../common/OptionsContainers";
import { Stack } from "@mui/material";
import NavigationButtons from "../common/NavigationButtons";
import { useParams, useRouter } from "next/navigation";
import { usePatchQuestion } from "@/app/api/profile/profile";
import GENERAL_QUESTIONS_COMPONENT_MAP from "./generalQuestions";

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
  const { step } = useParams();
  const stepAsNumber = parseInt(step as string) || 1;

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      router.push(`/questions/${stepAsNumber + 1}`);
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

  return (
    <Stack gap={2}>
      <FormControl sx={{ width: "100%" }} component="fieldset">
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
      </FormControl>
      <NavigationButtons
        onNextButtonClick={() => {
          answerMutate({ therapy_needs: therapyNeeds });
        }}
        onPrevButtonClick={() => {
          router.push(`/questions/${stepAsNumber - 1}`);
        }}
        isNextButtonDisabled={
          stepAsNumber ===
            Object.entries(GENERAL_QUESTIONS_COMPONENT_MAP).length ||
          therapyNeeds.length === 0
        }
        isPrevButtonDisabled={stepAsNumber === 1}
      />
    </Stack>
  );
};

export default TherapyNeeds;
