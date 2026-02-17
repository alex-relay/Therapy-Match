"use client";

import { useState, useContext } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "@/app/components/common/OptionsContainers";
import { useParams, useRouter } from "next/navigation";
import { usePatchAnonymousQuestion } from "@/app/api/profile/profile";
import {
  getAnonymousSessionNextStep,
  getPreviousStep,
  AnonymousQuestionsStepName,
} from "@/app/utils/utils";
import NavigationButtons from "@/app/components/common/NavigationButtons";
import { useNavContext } from "@/app/NavigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";
import { AnonymousPatientContext } from "./AnonymousPatientContext";

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
  const step = params.step as AnonymousQuestionsStepName;

  const { stepHistory, setStepHistory } = useNavContext();
  const { anonymousPatient } = useContext(AnonymousPatientContext);
  const gender = anonymousPatient?.gender ?? null;

  const [selectedValue, setSelectedValue] = useState<string | null>(gender);

  const nextStep = getAnonymousSessionNextStep(step);
  const isStepInStepHistory = stepHistory.indexOf(step) >= 0;

  const { mutate: answerMutate } = usePatchAnonymousQuestion({
    onSuccess: () => {
      if (!isStepInStepHistory) {
        setStepHistory((prevState) => [...prevState, step]);
      }

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

    if (selectedValue !== anonymousPatient?.gender) {
      answerMutate({ gender: selectedValue });
    } else {
      if (!isStepInStepHistory) {
        setStepHistory((prevState) => [...prevState, step]);
      }

      router.push(`/questions/${nextStep}`);
    }
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
          const previousStep = getPreviousStep(step, stepHistory);
          router.push(previousStep);
        }}
      />
    </QuestionFormWrapper>
  );
}
