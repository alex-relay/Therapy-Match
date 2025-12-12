"use client";

import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";

const StyledStack = styled(Stack)(({ theme }) => ({
  maxWidth: "1000px",
  width: "100%",
  height: "100%",
  gap: "10px",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 1),
  backgroundColor: theme.palette.success.light,
}));

export default StyledStack;
