"use client";

import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";

const validateAgeInput = (age: string, onError: (message: string) => void) => {
  if (!age) {
    onError("Please enter your age.");
    return false;
  }

  const ageNumber = Number(age);

  if (isNaN(ageNumber)) {
    onError("Age must be a number between 18 and 120");
    return false;
  }

  if (ageNumber > 120 || ageNumber < 18) {
    onError("Please enter a valid age between 18 and 120.");
    return false;
  }

  return true;
};

export default function AgeForm() {
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();

  const step = params.step as string;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateAgeInput(age, setError)) {
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
        inputMode="numeric"
        variant="outlined"
        sx={{ width: "40%" }}
        value={age}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setAge(event.target.value);
        }}
        helperText={!!error ? error : null}
        error={!!error}
      />
    </Box>
  );
}
