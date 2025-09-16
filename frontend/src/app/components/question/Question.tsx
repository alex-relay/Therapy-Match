"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import CardHeader from "@mui/material/CardHeader";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

type QuestionProps = {
  question: string;
  onAnswer: (index: number, value: number) => void;
  index: number;
};

const OPTIONS: { option: string; value: number }[] = [
  { option: "disagree", value: 1 },
  { option: "slightly disagree", value: 2 },
  { option: "neutral", value: 3 },
  { option: "slightly agree", value: 4 },
  { option: "agree", value: 5 },
];

const OptionButton = styled(Button)(({ theme }) => ({
  cursor: "pointer",
  ":hover": { backgroundColor: "gray" },
  border: "1px solid",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "600px",
  },
}));

const Question = ({ question, index, onAnswer }: QuestionProps) => (
  <Card variant="outlined" sx={{ maxWidth: "600px" }}>
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <CardHeader title={question} />
    </Box>
    <CardContent
      sx={{
        display: "flex",
        margin: "auto",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack direction="row" gap="5px">
        {OPTIONS.map(({ option, value }) => (
          <OptionButton
            size="small"
            onClick={() => {
              onAnswer(index, value);
            }}
            key={option}
            value={value}
          >
            <Typography> {option}</Typography>
          </OptionButton>
        ))}
      </Stack>
    </CardContent>
  </Card>
);

export default Question;
