"use client";

import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";

const StyledCard = styled(Card)(({ theme }) => ({
  ":hover": {
    cursor: "pointer",
    transform: "scale(1.05)",
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
    backgroundColor: theme.palette.action.hover,
  },
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "150px",
  width: "200px",
}));

export default StyledCard;
