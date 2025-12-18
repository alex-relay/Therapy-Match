"use client";

import Typography from "@mui/material/Typography";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import StyledCard from "@/app/components/common/StyledCard";
import { useRouter } from "next/navigation";
import { useCreatePersonalityTest } from "../api/scores/scores";

const PersonalityTestIntroduction = () => {
  const router = useRouter();
  const { mutate: personalityTestMutate } = useCreatePersonalityTest({
    onSuccess: () => {
      router.push("/personality-tests");
    },
  });

  return (
    <>
      <Typography variant="h3">Personality Test Start</Typography>
      <StyledCard
        onClick={() => {
          personalityTestMutate();
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
