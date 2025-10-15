"use client";

import { usePatchQuestion } from "@/app/api/profile/profile";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

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

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      router.push(`/questions/${parseInt(step) + 1}`);
    },
  });

  const step = params.step as string;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      onSubmit={handleSubmit}
      width="100%"
      display="flex"
      justifyContent="center"
    >
      <TextField
        type="text"
        variant="outlined"
        sx={{ width: "40%" }}
        value={postalCode}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setPostalCode(event.target.value);
        }}
        helperText={!!error ? error : null}
        error={!!error}
      />
    </Box>
  );
};

export default LocationForm;
