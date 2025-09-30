"use client";

import PageContainer from "@/app/components/common/PageContainer";
import StyledStack from "@/app/components/common/PageStyledStack";
import AgeForm from "@/app/components/generalQuestions/AgeForm";
import GenderForm from "@/app/components/generalQuestions/GenderForm";
import LocationForm from "@/app/components/generalQuestions/LocationForm";
import { CardContent, CardHeader } from "@mui/material";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useParams } from "next/navigation";

const GENERAL_QUESTIONS_MAP = {
  "1": "What is your gender identity?",
  "2": "What is your age?",
  "3": "In what city are you located?",
  "4": "What led you to consider therapy today?",
  "5": "What are your primary goals for therapy?",
  "6": "Have you received a mental health diagnosis in the past. If so, which one?",
  "7": "Are there certain qualities or traits that you are looking for in a therapist?",
};

const GENERAL_QUESTIONS_COMPONENT_MAP = {
  "1": <GenderForm />,
  "2": <AgeForm />,
  "3": <LocationForm />,
  "4": null,
  "5": null,
  "6": null,
  "7": null,
};

type Step = "1" | "2" | "3" | "4" | "5" | "6" | "7";

const Questions = () => {
  const params = useParams();
  const step = params.step as Step;

  if (!step || !GENERAL_QUESTIONS_MAP[step]) {
    return "Step does not exist";
  }

  const formComponent = step && GENERAL_QUESTIONS_COMPONENT_MAP[step];
  const headerTitle = step && GENERAL_QUESTIONS_MAP[step];

  return (
    <PageContainer>
      <StyledStack>
        <Typography>On step {params.step}</Typography>
        <Card variant="outlined" sx={{ width: "100%", maxWidth: "700px" }}>
          <CardHeader title={headerTitle} sx={{ textAlign: "center" }} />
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {formComponent}
          </CardContent>
        </Card>
      </StyledStack>
    </PageContainer>
  );
};

export default Questions;
