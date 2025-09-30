"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const validatePostalCode = (
  postalCode: string,
  onPostalCodeError: (message: string) => void,
) => {
  if (!postalCode) {
    onPostalCodeError("Please enter your postal code");
    return false;
  }

  const postalCodeRegex = /^[ABCEGHJ-NPRSTVXY]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

  if (!postalCodeRegex.test(postalCode)) {
    onPostalCodeError(
      "Please enter a valid postal code. Ensure all letters are uppercase",
    );
    return false;
  }

  return true;
};

const LocationForm = () => {
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const params = useParams();
  const router = useRouter();

  const step = params.step as string;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validatePostalCode(postalCode, setError)) {
      return;
    }
    router.push(`/questions/${parseInt(step) + 1}`);
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
