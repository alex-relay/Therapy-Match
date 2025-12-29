"use client";

import QuestionForm from "@/app/components/common/Question";
import { useParams } from "next/navigation";
import GENERAL_QUESTIONS_COMPONENT_MAP from "../../components/generalQuestions/generalQuestions";
import { PageName } from "@/app/utils/utils";

const Questions = () => {
  const params = useParams();
  const step = params.step as PageName;

  if (!step || !GENERAL_QUESTIONS_COMPONENT_MAP[step]) {
    return "Step does not exist";
  }

  const FormComponent =
    step && GENERAL_QUESTIONS_COMPONENT_MAP[step]?.component;
  const headerTitle = step && GENERAL_QUESTIONS_COMPONENT_MAP[step]?.title;

  return (
    <QuestionForm.Card
      variant="outlined"
      sx={{ width: "100%", maxWidth: "800px" }}
    >
      <QuestionForm.Header title={headerTitle} sx={{ textAlign: "center" }} />
      <QuestionForm.Content
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <FormComponent />
      </QuestionForm.Content>
    </QuestionForm.Card>
  );
};

export default Questions;
