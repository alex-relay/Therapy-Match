import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Tile from "../../common/Tile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { PersonalityTestGetResponse } from "@/app/api/scores/scores";
import { TherapistDashboardResponse } from "@/app/api/profile/profile";

interface TileSectionProps {
  handleProfileTileClick: () => void;
  personalityTestTileHandler: () => void;
  isTherapistDashboardLoading: boolean;
  therapistDashboard: TherapistDashboardResponse | undefined;
}

const getPersonalityTestTileCopy = (
  rawScores: PersonalityTestGetResponse | undefined,
  completedTest,
) => {
  if (rawScores && completedTest) {
    return "Personality Test";
  }

  if (rawScores && !completedTest) {
    return "Complete Personality Test";
  }

  return "Start Personality Test";
};

const getUserProfileTileCopy = (
  therapistDashboard: TherapistDashboardResponse | undefined,
) => {
  if (!therapistDashboard?.is_profile_complete) {
    return "Complete Profile";
  }

  return "Profile";
};

const TileSection = ({
  handleProfileTileClick,
  personalityTestTileHandler,
  isTherapistDashboardLoading,
  therapistDashboard,
}: TileSectionProps) => {
  const theme = useTheme();

  const personalityTestTitleText = getPersonalityTestTileCopy(
    therapistDashboard?.personality_test_scores,
    therapistDashboard?.completed_personality_test,
  );

  const profileTileTitleText = getUserProfileTileCopy(therapistDashboard);

  const isPersonalityTestIconDisplayed =
    !!therapistDashboard?.completed_personality_test;

  return (
    <Stack
      width="100%"
      maxWidth="1000px"
      gap="50px"
      sx={{
        [theme.breakpoints.down("md")]: {
          alignItems: "start",
        },
      }}
    >
      <Stack alignItems="center" borderRadius="10px" width="100%">
        {isTherapistDashboardLoading ? (
          <div>Loading...</div>
        ) : (
          <Tile
            onTileClick={handleProfileTileClick}
            title={profileTileTitleText}
            sx={{ width: "100%" }}
          />
        )}
      </Stack>
      <Stack borderRadius="10px" width="100%" alignItems="center">
        {isTherapistDashboardLoading ? (
          <div>Loading...</div>
        ) : (
          <Tile
            onTileClick={personalityTestTileHandler}
            title={personalityTestTitleText}
            sx={{ width: "100%" }}
            isImageDisplayed={isPersonalityTestIconDisplayed}
            image={
              <CheckCircleOutlineIcon
                color="success"
                fontSize="large"
                sx={{ width: "50px", height: "50px" }}
              />
            }
          />
        )}
      </Stack>
    </Stack>
  );
};

export default TileSection;
