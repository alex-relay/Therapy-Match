"use client";

import Stack from "@mui/material/Stack";
import { SxProps } from "@mui/material/styles";

type QuestionFormWrapperProps = {
  children: React.ReactNode;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  wrapperSx?: SxProps;
};

const QuestionFormWrapper = ({
  children,
  handleSubmit,
  wrapperSx = {},
}: QuestionFormWrapperProps) => {
  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      sx={{ gap: 2, width: "100%", ...wrapperSx }}
    >
      {children}
    </Stack>
  );
};

export default QuestionFormWrapper;
