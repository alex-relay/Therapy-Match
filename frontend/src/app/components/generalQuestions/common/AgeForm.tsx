"use client";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import NavigationButtons from "../../common/NavigationButtons";
import { SharedFormProps } from "@/app/utils/utils";
import QuestionFormWrapper from "../client/QuestionFormWrapper";

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

export default function AgeForm<T extends string>({
  entity,
  nextStep,
  step,
  stepHistory,
  onAnswerMutate,
  onStepHistoryChange,
  previousStep,
}: SharedFormProps<T, { age: number }>) {
  const [error, setError] = useState("");
  const router = useRouter();

  const entityAge = entity?.age ? String(entity?.age) : "";

  const [age, setAge] = useState<string>(entityAge);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAgeInput(age, setError)) {
      return;
    }

    if (age !== entityAge) {
      onAnswerMutate({ age: Number(age) });
      return;
    }

    if (!stepHistory?.includes(step)) {
      onStepHistoryChange((prevState) => [...prevState, step]);
    }

    router.push(nextStep);
  };

  const isPrevButtonDisabled =
    !stepHistory.length || stepHistory.indexOf(step) === 0;

  // TODO: refactor this to a date of birth with calendar picker.
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
            if (error) {
              setError("");
            }
          }}
          helperText={!!error ? error : null}
          error={!!error}
        />
      </Box>
      <NavigationButtons
        onPrevButtonClick={() => {
          router.push(previousStep);
        }}
        isNextButtonDisabled={!age}
        isPrevButtonDisabled={isPrevButtonDisabled}
      />
    </QuestionFormWrapper>
  );
}
