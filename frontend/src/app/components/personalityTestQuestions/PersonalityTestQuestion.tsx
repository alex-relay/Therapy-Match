"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
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

const StyledOptionButton = styled(Button)(({ theme }) => ({
  cursor: "pointer",
  ":hover": { backgroundColor: theme.palette.action.hover },
  border: "1px solid",
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

const StyledOptionsBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: "10px",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    width: "100%",
  },
}));

const Question = ({ question, index, onAnswer }: QuestionProps) => (
  <Card sx={{ width: "100%" }} variant="outlined">
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
      <StyledOptionsBox>
        {OPTIONS.map(({ option, value }) => (
          <StyledOptionButton
            size="small"
            onClick={() => {
              onAnswer(index, value);
            }}
            key={option}
            value={value}
          >
            <Typography> {option}</Typography>
          </StyledOptionButton>
        ))}
      </StyledOptionsBox>
    </CardContent>
  </Card>
);

export default Question;
