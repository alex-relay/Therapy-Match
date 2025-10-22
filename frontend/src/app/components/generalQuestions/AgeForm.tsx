"use client";
import { usePatchQuestion } from "../../api/profile/profile";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";

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
  const step = params.step as string;

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      router.push(`/questions/${parseInt(step) + 1}`);
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
        placeholder="e.g. 27"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setAge(event.target.value);
        }}
        helperText={!!error ? error : null}
        error={!!error}
      />
    </Box>
  );
}
