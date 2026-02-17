"use client";

import { usePatchAnonymousQuestion } from "@/app/api/profile/profile";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useParams, useRouter } from "next/navigation";
import { useContext, useState } from "react";
import NavigationButtons from "../../common/NavigationButtons";
import {
  getAnonymousSessionNextStep,
  getPreviousStep,
  AnonymousQuestionsStepName,
} from "@/app/utils/utils";
import { useNavContext } from "@/app/NavigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";
import { AnonymousPatientContext } from "./AnonymousPatientContext";
import { validatePostalCode, transformPostalCode } from "../utils";

const LocationForm = () => {
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();
  const { stepHistory, setStepHistory } = useNavContext();

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

  const { anonymousPatient } = useContext(AnonymousPatientContext);

  const [postalCode, setPostalCode] = useState(
    anonymousPatient?.postal_code ?? "",
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanPostalCode = transformPostalCode(postalCode);

    if (!validatePostalCode(cleanPostalCode)) {
      setError("Please enter a valid postal code (e.g., M5A 4L1)");
      return;
    }

    if (cleanPostalCode !== anonymousPatient?.postal_code) {
      answerMutate({ postal_code: cleanPostalCode });
    } else {
      if (!isStepInStepHistory) {
        setStepHistory((prevState) => [...prevState, step]);
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
        isPrevButtonDisabled={step === "gender"}
        isNextButtonDisabled={!postalCode}
        onPrevButtonClick={() => {
          const previousStep = getPreviousStep(step, stepHistory);
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
