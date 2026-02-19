"use client";

import { usePatchAnonymousQuestion } from "@/app/api/profile/profile";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NavigationButtons from "../../common/NavigationButtons";
import { AnonymousStepComponentProps } from "@/app/utils/utils";
import QuestionFormWrapper from "./QuestionFormWrapper";
import { validatePostalCode, transformPostalCode } from "../utils";

const LocationForm = ({
  entity,
  nextStep,
  step,
  onStepHistoryChange,
  stepHistory,
  previousStep,
}: AnonymousStepComponentProps) => {
  const [error, setError] = useState("");
  const router = useRouter();
  const [postalCode, setPostalCode] = useState(entity?.postal_code ?? "");

  const isStepInStepHistory = stepHistory.includes(step);

  const { mutate: answerMutate } = usePatchAnonymousQuestion({
    onSuccess: () => {
      if (!isStepInStepHistory) {
        onStepHistoryChange((prevState) => [...prevState, step]);
      }
      router.push(`/questions/${nextStep}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanPostalCode = transformPostalCode(postalCode);

    if (!validatePostalCode(cleanPostalCode)) {
      setError("Please enter a valid postal code (e.g., M5A 4L1)");
      return;
    }

    if (cleanPostalCode !== entity?.postal_code) {
      answerMutate({ postal_code: cleanPostalCode });
    } else {
      if (!isStepInStepHistory) {
        onStepHistoryChange((prevState) => [...prevState, step]);
      }
      router.push(`/questions/${nextStep}`);
    }
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <Box margin={"auto"}>
        <TextField
          type="text"
          variant="outlined"
          value={postalCode}
          aria-label="Postal Code"
          placeholder="e.g., M5A 4L1"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setPostalCode(event.target.value);
          }}
          helperText={error || null}
          error={!!error}
        />
      </Box>
      <NavigationButtons
        isPrevButtonDisabled={!previousStep}
        isNextButtonDisabled={!postalCode}
        onPrevButtonClick={() => {
          router.push(previousStep);
        }}
        sx={{
          width: "100%",
        }}
      />
    </QuestionFormWrapper>
  );
};

export default LocationForm;
