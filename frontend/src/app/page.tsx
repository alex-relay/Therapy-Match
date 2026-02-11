"use client";
import Typography from "@mui/material/Typography";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import { useRouter } from "next/navigation";
import StyledCard from "./components/common/StyledCard";
import Stack from "@mui/material/Stack";
import { signIn } from "next-auth/react";

export default function Home() {
  const router = useRouter();

  // TODO: implement a toast/snackbar for better user feedback
  const handlePatientTileClick = async () => {
    const res = await signIn("anonymous-session", {
      redirect: false,
    });

    if (res?.error) {
      console.error("Failed to create anonymous session:", res.error);
      return;
    }

    if (res?.ok) {
      sessionStorage.setItem("stepHistory", JSON.stringify([]));
      router.push("/questions/gender");
    }
  };

  return (
    <>
      <Typography variant="h3">
        What type of therapy are you looking for?
      </Typography>
      <Stack direction="row" gap={12.5}>
        <StyledCard
          onClick={handlePatientTileClick}
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
