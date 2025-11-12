"use client";

import { usePatchQuestion } from "@/app/api/profile/profile";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import NavigationButtons from "../common/NavigationButtons";
import { getNextStep, PageName } from "@/app/utils/utils";
import { useNavContext } from "@/app/NavigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";

const transformPostalCode = (postalCode: string) => {
  if (!postalCode) {
    return "";
  }
  const cleaned = postalCode.replace(/\s+/g, "").toUpperCase();
  if (cleaned.length >= 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  }
  return cleaned;
};

const validatePostalCode = (
  postalCode: string | null,
  onPostalCodeError: (msg: string) => void,
) => {
  const errorMessage = "Please enter a valid postal code (e.g., M5A 4L1)";
  if (!postalCode) {
    onPostalCodeError(errorMessage);
    return false;
  }

  const cleaned = postalCode
    .replace(/\u00A0/g, " ")
    .trim()
    .toUpperCase();

  const postalCodeRegex = /^[ABCEGHJ-NPRSTVXY]\d[A-Z][ -]?\d[A-Z]\d$/;

  if (!postalCodeRegex.test(cleaned)) {
    onPostalCodeError(errorMessage);
    return false;
  }

  return true;
};

const LocationForm = () => {
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();
  const { setStepHistory, goToPreviousStep } = useNavContext();

  const step = params.step as PageName;

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      const nextStep = getNextStep(step);
      setStepHistory((prevState) => [...prevState, step]);
      router.push(`/questions/${nextStep}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanPostalCode = transformPostalCode(postalCode);
    if (!validatePostalCode(cleanPostalCode, setError)) {
      return;
    }
    answerMutate({ postal_code: cleanPostalCode });
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
        isPrevButtonDisabled={step === "gender"}
        isNextButtonDisabled={!postalCode}
        onPrevButtonClick={() => goToPreviousStep(step)}
        sx={{
          width: "100%",
        }}
      />
    </QuestionFormWrapper>
  );
};

export default LocationForm;
