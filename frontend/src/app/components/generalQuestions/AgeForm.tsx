"use client";
import { usePatchQuestion } from "../../api/profile/profile";
import { useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import NavigationButtons from "../common/NavigationButtons";
import { getNextStep, PageName } from "@/app/utils/utils";
import { NavContext } from "@/app/navigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";

const validateAgeInput = (age: string, onError: (message: string) => void) => {
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
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateAgeInput(age, setError)) {
      return;
    }
    answerMutate({ age: Number(age) });
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
        isNextButtonDisabled={!age}
        isPrevButtonDisabled={false}
      />
    </QuestionFormWrapper>
  );
}
