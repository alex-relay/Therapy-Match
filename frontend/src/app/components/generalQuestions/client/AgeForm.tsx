"use client";
import { usePatchAnonymousQuestion } from "../../../api/profile/profile";
import { useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import NavigationButtons from "../../common/NavigationButtons";
import {
  getAnonymousSessionNextStep,
  getPreviousStep,
  AnonymousQuestionsStepName,
} from "@/app/utils/utils";
import { useNavContext } from "@/app/NavigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";
import { AnonymousPatientContext } from "./AnonymousPatientContext";

const validateAgeInput = (
  age: string | null,
  onError: (message: string) => void,
) => {
  const validAgeString = "Please enter a valid age between 18 and 120.";
  if (!age) {
    onError("Please enter your age.");
    return false;
  }

  const ageNumber = Number(age);

  if (isNaN(ageNumber)) {
    onError(validAgeString);
    return false;
  }

  if (ageNumber > 120 || ageNumber < 18) {
    onError(validAgeString);
    return false;
  }

  return true;
};

export default function AgeForm() {
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();

  const { stepHistory, setStepHistory } = useNavContext();
  const { anonymousPatient } = useContext(AnonymousPatientContext);

  const anonymousPatientAge = anonymousPatient?.age
    ? String(anonymousPatient?.age)
    : "";

  const [age, setAge] = useState<string | null>(anonymousPatientAge);

  const step = params.step as AnonymousQuestionsStepName;
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAgeInput(age, setError)) {
      return;
    }

    if (age !== anonymousPatientAge) {
      answerMutate({ age: Number(age) });
    } else {
      if (!isStepInStepHistory) {
        setStepHistory((prevState) => [...prevState, step]);
      }

      router.push(`/questions/${nextStep}`);
    }
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <Box margin="auto">
        <TextField
          type="text"
          inputMode="numeric"
          variant="outlined"
          value={age}
          placeholder="e.g. 27"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setAge(event.target.value);
          }}
          helperText={!!error ? error : null}
          error={!!error}
        />
      </Box>
      <NavigationButtons
        onPrevButtonClick={() => {
          const previousStep = getPreviousStep(step, stepHistory);
          router.push(previousStep);
        }}
        isNextButtonDisabled={!age}
        isPrevButtonDisabled={false}
      />
    </QuestionFormWrapper>
  );
}
