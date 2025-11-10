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
import { useQueryClient } from "@tanstack/react-query";
import { AnonymousPatientContext } from "./anonymousPatientContext";

const OPTIONS_MAP = {
  male: "Male",
  female: "Female",
  non_binary: "Non-binary",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
} as const;

type GenderFormValues = keyof typeof OPTIONS_MAP | "";

export default function GenderForm() {
  const router = useRouter();
  const params = useParams();
  const step = params.step as PageName;
  const { stepHistory, setStepHistory } = useContext(NavContext);
  const { anonymousPatient } = useContext(AnonymousPatientContext);
  const gender = anonymousPatient?.gender ?? null;
  const queryClient = useQueryClient();
  const [selectedValue, setSelectedValue] = useState<string | null>(gender);

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
    setSelectedValue(event.target.value as GenderFormValues);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // if (selectedValue !== anonymousPatient?.gender) {
    answerMutate({ gender: selectedValue });
    // }

    // const nextStep = getNextStep(step);

    // if (stepHistory.indexOf(step) < 0) {
    //   setStepHistory((prevState) => [...prevState, step]);
    // }

    // router.push(`/questions/${nextStep}`);
  };

  const handleIsChecked = (key: string) => {
    if (selectedValue) {
      return selectedValue === key;
    }

    if (!selectedValue && anonymousPatient?.gender) {
      return key === anonymousPatient?.gender;
    }

    return false;
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <FormControl
        id="gender-question-label"
        sx={{
          margin: "auto",
          width: "80%",
          display: "block",
        }}
      >
        <RadioGroup
          aria-labelledby="gender-question-label"
          name="selectedGender"
          sx={{ gap: 2 }}
          onChange={handleRadioButtonChange}
        >
          {Object.entries(OPTIONS_MAP).map(([key, value]) => (
            <StyledFormControlLabel
              key={key}
              label={value}
              value={key}
              control={<StyledRadioButton />}
              checked={handleIsChecked(key)}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <NavigationButtons
        isNextButtonDisabled={!selectedValue && !gender}
        isPrevButtonDisabled={
          !stepHistory.length || stepHistory.indexOf(step) === 0
        }
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
