"use client";
import { useRouter } from "next/navigation";
import { useCreateTherapistPersonalityTest } from "@/app/api/scores/scores";
import { useGetTherapistDashboard } from "@/app/api/profile/profile";
import TileSection from "@/app/components/therapist/dashboard/TileSection";

export default function Page() {
  const router = useRouter();

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
    sessionStorage.setItem("therapistProfileStepHistory", JSON.stringify([]));
    router.push("/therapist/questions/gender");
  };

  return (
    <>
      <TileSection
        handleProfileTileClick={handleProfileTileClick}
        personalityTestTileHandler={personalityTestTileHandler}
        isTherapistDashboardLoading={isTherapistDashboardLoading}
        therapistDashboard={therapistDashboard}
      />
    </>
  );
}
