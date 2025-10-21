"use client";

import PageContainer from "../../components/common/PageContainer";
import StyledStack from "../../components/common/PageStyledStack";
import AgeForm from "../../components/generalQuestions/AgeForm";
import GenderForm from "../../components/generalQuestions/GenderForm";
import LocationForm from "../../components/generalQuestions/LocationForm";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Card from "@mui/material/Card";
import { useParams } from "next/navigation";
import TherapyNeeds from "@/app/components/generalQuestions/TherapyNeedsForm";

const GENERAL_QUESTIONS_COMPONENT_MAP = {
  "1": {
    component: GenderForm,
    title: "What is your gender identity?",
  },
  "2": { component: AgeForm, title: "What is your age?" },
  "3": { component: LocationForm, title: "What is your postal code?" },
  "4": {
    component: TherapyNeeds,
    title: "What led you to consider therapy today?",
  },
  "5": null,
  "6": null,
  "7": null,
};

type Step = "1" | "2" | "3" | "4" | "5" | "6" | "7";

const Questions = () => {
  const params = useParams();
  const step = params.step as Step;

  if (!step || !GENERAL_QUESTIONS_COMPONENT_MAP[step]) {
    return "Step does not exist";
  }

  const FormComponent =
    step && GENERAL_QUESTIONS_COMPONENT_MAP[step]?.component;
  const headerTitle = step && GENERAL_QUESTIONS_COMPONENT_MAP[step]?.title;

  return (
    <PageContainer>
      <StyledStack>
        <Card variant="outlined" sx={{ width: "100%", maxWidth: "800px" }}>
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
            {<FormComponent />}
          </CardContent>
        </Card>
      </StyledStack>
    </PageContainer>
  );
};

export default Questions;
