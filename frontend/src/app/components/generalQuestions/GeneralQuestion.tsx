import { ReactNode } from "react";
import QuestionForm from "../common/Question";

type GeneralQuestionProps = {
  headerTitle: string;
  children: ReactNode;
};

const GeneralQuestion = ({ headerTitle, children }: GeneralQuestionProps) => (
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
      {children}
    </QuestionForm.Content>
  </QuestionForm.Card>
);

export default GeneralQuestion;
