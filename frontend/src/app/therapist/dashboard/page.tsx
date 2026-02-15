"use client";
import Tile from "@/app/components/common/Tile";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const theme = useTheme();

  const handleProfileTileClick = () =>
    router.push("/therapist/questions/gender");
  const handlePersonalityTestTileClick = () =>
    router.push("/therapist/personality-tests");

  return (
    <>
      <Stack
        flexDirection="row"
        width="100%"
        maxWidth="1000px"
        justifyContent="space-between"
        sx={{
          [theme.breakpoints.down("md")]: {
            flexDirection: "column",
            alignItems: "start",
            gap: "50px",
          },
        }}
      >
        <Stack
          border="5px solid red"
          padding="50px"
          borderRadius="10px"
          sx={{
            [theme.breakpoints.down("md")]: {
              width: "100%",
              alignItems: "center",
            },
          }}
        >
          <Tile onTileClick={handleProfileTileClick} title="Complete Profile" />
        </Stack>
        <Stack
          border="5px solid red"
          padding="50px"
          borderRadius="10px"
          sx={{
            [theme.breakpoints.down("md")]: {
              width: "100%",
              alignItems: "center",
            },
          }}
        >
          <Tile
            onTileClick={handlePersonalityTestTileClick}
            title="Start Personality Test"
          />
        </Stack>
      </Stack>
    </>
  );
}
