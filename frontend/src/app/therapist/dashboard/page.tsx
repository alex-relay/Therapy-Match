"use client";
import Tile from "@/app/components/common/Tile";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { useCreateTherapistPersonalityTest } from "@/app/api/scores/scores";
import { useGetTherapistDashboard } from "@/app/api/profile/profile";

export default function Page() {
  const router = useRouter();
  const theme = useTheme();

  const { data: therapistDashboard, isLoading: isTherapistDashboardLoading } =
    useGetTherapistDashboard();

  const { mutate: createTherapistPersonalityTest, isPending } =
    useCreateTherapistPersonalityTest({
      onSuccess: (data) => {
        if (data.id) {
          router.push("/therapist/personality-test");
        } else {
          console.error("Personality test creation returned no id", data);
        }
      },
      // TODO: refactor this for the mutation function to handle the error
      onError: (error) => {
        console.error("Failed to create personality test", error);
      },
    });

  const isPersonalityTestStarted =
    !!therapistDashboard?.personality_test_scores;

  const personalityTestTitleText = isPersonalityTestStarted
    ? "Complete Personality Test"
    : "Start Personality Test";

  const handleCompletePersonalityTestTileClick = () => {
    router.push("/therapist/personality-test");
  };

  const handleStartPersonalityTestTileClick = () => {
    // to prevent a double click
    if (!isPending) {
      createTherapistPersonalityTest();
    }
  };

  const personalityTestTileHandler = isPersonalityTestStarted
    ? handleCompletePersonalityTestTileClick
    : handleStartPersonalityTestTileClick;

  const handleProfileTileClick = () => {
    sessionStorage.setItem("therapistStepHistory", JSON.stringify([]));
    router.push("/therapist/questions/gender");
  };

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
          {isTherapistDashboardLoading ? (
            <div>Loading...</div>
          ) : (
            <Tile
              onTileClick={personalityTestTileHandler}
              title={personalityTestTitleText}
            />
          )}
        </Stack>
      </Stack>
    </>
  );
}
