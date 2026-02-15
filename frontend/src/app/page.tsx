"use client";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import Stack from "@mui/material/Stack";
import { signIn } from "next-auth/react";
import Tile from "./components/common/Tile";

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

  const handleTherapistTileClick = () => {
    sessionStorage.setItem("stepHistory", JSON.stringify([]));
    router.push("/register?type=therapist");
  };

  return (
    <>
      <Typography variant="h3">
        What type of therapy are you looking for?
      </Typography>
      <Stack direction="row" gap={12.5}>
        <Tile
          onTileClick={handlePatientTileClick}
          title="Myself"
          image="/globe.svg"
          alt="globe"
        />
        <Tile
          onTileClick={handleTherapistTileClick}
          title="Therapist"
          image="/globe.svg"
          alt="globe"
        />
      </Stack>
    </>
  );
}
