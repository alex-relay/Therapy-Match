import { useState } from "react";
import NavigationButtons from "../../common/NavigationButtons";
import QuestionFormWrapper from "../client/QuestionFormWrapper";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { transformPostalCode, validatePostalCode } from "../utils";

const LocationForm = () => {
  const [postalCode, setPostalCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const cleanPostalCode = transformPostalCode(postalCode);
    const isValidPostalCode = validatePostalCode(cleanPostalCode);

    if (!isValidPostalCode) {
      setError("Please enter a valid postal code (e.g., M5A 4L1)");
    }

    setError(null);
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
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
      <Box></Box>
      <NavigationButtons
        onPrevButtonClick={() => {}}
        onNextButtonClick={() => {}}
      />
    </QuestionFormWrapper>
  );
};

export default LocationForm;
