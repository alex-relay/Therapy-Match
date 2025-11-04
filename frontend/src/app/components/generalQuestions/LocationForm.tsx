"use client";

import { usePatchQuestion } from "@/app/api/profile/profile";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useParams, useRouter } from "next/navigation";
import { useContext, useState } from "react";
import NavigationButtons from "../common/NavigationButtons";
import { getNextStep, PageName } from "@/app/utils/utils";
import { NavContext } from "@/app/navigationContext";

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
  const { history, setHistory } = useContext(NavContext);

  const step = params.step as PageName;

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      const nextStep = getNextStep(step);
      router.push(`/questions/${nextStep}`);
      setHistory((prevState) => [...prevState, step]);
    },
  });

  const handleNextButtonClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanPostalCode = transformPostalCode(postalCode);
    if (!validatePostalCode(cleanPostalCode, setError)) {
      return;
    }
    answerMutate({ postal_code: cleanPostalCode });
  };

  return (
    <Box
      component="form"
      width="100%"
      display="flex"
      onSubmit={handleNextButtonClick}
      flexDirection="column"
      justifyContent="center"
      gap={2}
    >
      <Box
        sx={{
          margin: "auto",
        }}
      >
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
          if (!history.length) {
            router.push(`/`);
          }

          router.push(`/questions/${history[history.length - 1]}`);

          setHistory((prevState) =>
            prevState.filter((_, i) => i < prevState.length - 1),
          );
        }}
        sx={{
          width: "100%",
        }}
      />
    </Box>
  );
};

export default LocationForm;
