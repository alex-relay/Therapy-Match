"use client";
import Typography from "@mui/material/Typography";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import { useRouter } from "next/navigation";
import { useCreateAnonymousSession } from "../app/api/users/users";
import StyledCard from "./components/common/StyledCard";
import Stack from "@mui/material/Stack";

export default function Home() {
  const router = useRouter();

  const { mutate: anonymousSessionMutate } = useCreateAnonymousSession({
    onSuccess: () => {
      router.push("/questions/gender");
    },
  });

  return (
    <>
      <Typography variant="h3">
        What type of therapy are you looking for?
      </Typography>
      <Stack direction="row" gap={12.5}>
        <StyledCard
          onClick={() => {
            anonymousSessionMutate();
            sessionStorage.setItem("stepHistory", JSON.stringify([]));
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
        <StyledCard
          onClick={() => {
            router.push("/register?type=therapist");
            sessionStorage.setItem("stepHistory", JSON.stringify([]));
          }}
          variant="outlined"
          data-testid="therapist-tile"
        >
          <CardHeader title="Therapist" />
          <CardMedia
            component="img"
            height="100px"
            src="/globe.svg"
            alt="globe"
          />
        </StyledCard>
      </Stack>
    </>
  );
}
