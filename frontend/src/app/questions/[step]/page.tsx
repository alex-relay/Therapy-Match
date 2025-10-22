"use client";

import PageContainer from "../../components/common/PageContainer";
import StyledStack from "../../components/common/PageStyledStack";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Card from "@mui/material/Card";
import { useParams } from "next/navigation";
import GENERAL_QUESTIONS_COMPONENT_MAP from "../../components/generalQuestions/generalQuestions";

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
