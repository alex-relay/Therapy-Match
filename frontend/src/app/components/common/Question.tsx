import CardHeader from "@mui/material/CardHeader";
import CardContent, { CardContentProps } from "@mui/material/CardContent";
import CardActions, { CardActionsProps } from "@mui/material/CardActions";
import Card, { CardProps } from "@mui/material/Card";

const QuestionForm = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const QuestionCard = ({
  children,
  ...restProps
}: CardProps & {
  children: React.ReactNode;
}) => <Card {...restProps}>{children}</Card>;

const QuestionContent = ({
  children,
  ...restProps
}: CardContentProps & {
  children: React.ReactNode;
}) => <CardContent {...restProps}>{children}</CardContent>;

const QuestionHeader = ({ ...props }) => <CardHeader {...props} />;

const QuestionActions = ({
  children,
  ...restProps
}: CardActionsProps & { children: React.ReactNode }) => (
  <CardActions {...restProps}>{children}</CardActions>
);

QuestionForm.Content = QuestionContent;
QuestionForm.Card = QuestionCard;
QuestionForm.Header = QuestionHeader;
QuestionForm.Actions = QuestionActions;

export default QuestionForm;
