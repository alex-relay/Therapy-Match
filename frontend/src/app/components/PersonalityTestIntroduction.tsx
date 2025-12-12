"use client";

import Typography from "@mui/material/Typography";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import StyledCard from "@/app/components/common/StyledCard";
import { useRouter } from "next/navigation";

const PersonalityTestIntroduction = () => {
  const router = useRouter();
  return (
    <>
      <Typography variant="h3">Personality Test Start</Typography>
      <StyledCard
        onClick={() => {
          console.log("clicked");
          router.push("/personality-tests");
        }}
        variant="outlined"
        data-testid="myself-tile"
      >
        <CardHeader title="Myself" />
        <CardMedia
          component="img"
          height="100px"
          src="/globe.svg"
          alt="globe"
        />
      </StyledCard>
    </>
  );
};

export default PersonalityTestIntroduction;
