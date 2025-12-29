import { CategoryType } from "../api/scores/scores";
import GENERAL_QUESTIONS_COMPONENT_MAP from "../components/generalQuestions/generalQuestions";

export type QuestionOptions = {
  agree: number;
  slightly_agree: number;
  neutral: number;
  disagree: number;
  slightly_disagree: number;
};

export type PersonalityTestQuestionAndAnswers = {
  question: string;
  backendId: string;
  category: CategoryType;
  id: string;
};

const PERSONALITY_TEST_QUESTIONS: PersonalityTestQuestionAndAnswers[] = [
  {
    id: "extroversion_1",
    backendId: "1",
    question: "I am the life of the party.",
    category: "extroversion",
  },
  {
    id: "agreeableness_1",
    backendId: "1",
    question: "I feel little concern for others.",
    category: "agreeableness",
  },
  {
    id: "conscientiousness_1",
    backendId: "1",
    question: "I am always prepared.",
    category: "conscientiousness",
  },
  {
    id: "neuroticism_1",
    backendId: "1",
    question: "I get stressed out easily.",
    category: "neuroticism",
  },
  {
    id: "openness_1",
    backendId: "1",
    question: "I have a rich vocabulary.",
    category: "openness",
  },
  {
    id: "extroversion_2",
    backendId: "2",
    question: "I don't talk a lot.",
    category: "extroversion",
  },
  {
    id: "agreeableness_2",
    backendId: "2",
    question: "I am interested in people.",
    category: "agreeableness",
  },
  {
    id: "conscientiousness_2",
    backendId: "2",
    question: "I leave my belongings around.",
    category: "conscientiousness",
  },
  {
    id: "neuroticism_2",
    backendId: "2",
    question: "I am relaxed most of the time.",
    category: "neuroticism",
  },
  {
    id: "openness_2",
    backendId: "2",
    question: "I have difficulty understanding abstract ideas.",
    category: "openness",
  },
  {
    id: "extroversion_3",
    backendId: "3",
    question: "I feel comfortable around people.",
    category: "extroversion",
  },
  {
    id: "agreeableness_3",
    backendId: "3",
    question: "I insult people.",
    category: "agreeableness",
  },
  {
    id: "conscientiousness_3",
    backendId: "3",
    question: "I pay attention to details.",
    category: "conscientiousness",
  },
  {
    id: "neuroticism_3",
    backendId: "3",
    question: "I worry about things.",
    category: "neuroticism",
  },
  {
    id: "openness_3",
    backendId: "3",
    question: "I have a vivid imagination.",
    category: "openness",
  },
  {
    id: "extroversion_4",
    backendId: "3",
    question: "I keep in the background.",
    category: "extroversion",
  },
  {
    id: "agreeableness_4",
    backendId: "4",
    question: "I sympathize with others' feelings.",
    category: "agreeableness",
  },
  {
    id: "conscientiousness_4",
    backendId: "4",
    question: "I make a mess of things.",
    category: "conscientiousness",
  },

  {
    id: "neuroticism_4",
    backendId: "4",
    question: "I seldom feel blue.",
    category: "neuroticism",
  },
  {
    id: "openness_4",
    backendId: "4",
    question: "I am not interested in abstract ideas.",
    category: "openness",
  },
  {
    id: "extroversion_5",
    backendId: "5",
    question: "I start conversations.",
    category: "extroversion",
  },
  {
    id: "agreeableness_5",
    backendId: "5",
    question: "I am not interested in other people's problems.",
    category: "agreeableness",
  },
  {
    id: "conscientiousness_5",
    backendId: "5",
    question: "I get chores done right away.",
    category: "conscientiousness",
  },
  {
    id: "neuroticism_5",
    backendId: "5",
    question: "I am easily disturbed.",
    category: "neuroticism",
  },
  {
    id: "openness_5",
    backendId: "5",
    question: "I have excellent ideas.",
    category: "openness",
  },
  {
    id: "extroversion_6",
    backendId: "6",
    question: "I have little to say.",
    category: "extroversion",
  },
  {
    id: "agreeableness_6",
    backendId: "6",
    question: "I have a soft heart.",
    category: "agreeableness",
  },
  {
    id: "conscientiousness_6",
    backendId: "6",
    question: "I often forget to put things back in their proper place.",
    category: "conscientiousness",
  },
  {
    id: "neuroticism_6",
    question: "I get upset easily.",
    category: "neuroticism",
    backendId: "6",
  },
  {
    id: "openness_6",
    question: "I do not have a good imagination.",
    backendId: "6",
    category: "openness",
  },
  {
    id: "extroversion_7",
    backendId: "7",
    question: "I talk to a lot of different people at parties.",
    category: "extroversion",
  },
  {
    id: "agreeableness_7",
    backendId: "7",
    question: "I am not really interested in others.",
    category: "agreeableness",
  },
  {
    id: "conscientiousness_7",
    backendId: "7",
    question: "I like order.",
    category: "conscientiousness",
  },
  {
    id: "neuroticism_7",
    backendId: "7",
    question: "I change my mood a lot.",
    category: "neuroticism",
  },
  {
    id: "openness_7",
    backendId: "7",
    question: "I am quick to understand things.",
    category: "openness",
  },
  {
    id: "extroversion_8",
    backendId: "8",
    question: "I don't like to draw attention to myself.",
    category: "extroversion",
  },
  {
    id: "agreeableness_8",
    backendId: "8",
    question: "I take time out for others.",
    category: "agreeableness",
  },
  {
    id: "conscientiousness_8",
    backendId: "8",
    question: "I shirk my duties.",
    category: "conscientiousness",
  },
  {
    id: "neuroticism_8",
    backendId: "8",
    question: "I have frequent mood swings.",
    category: "neuroticism",
  },
  {
    id: "openness_8",
    backendId: "8",
    question: "I use difficult words.",
    category: "openness",
  },
  {
    id: "extroversion_9",
    backendId: "9",
    question: "I don't mind being the center of attention.",
    category: "extroversion",
  },
  {
    id: "agreeableness_9",
    backendId: "9",
    question: "I feel others' emotions.",
    category: "agreeableness",
  },
  {
    id: "conscientiousness_9",
    backendId: "9",
    question: "I follow a schedule.",
    category: "conscientiousness",
  },
  {
    id: "neuroticism_9",
    backendId: "9",
    question: "I get irritated easily.",
    category: "neuroticism",
  },
  {
    id: "openness_9",
    backendId: "9",
    question: "I spend time reflecting on things.",
    category: "openness",
  },
  {
    id: "extroversion_10",
    backendId: "10",
    question: "I am quiet around strangers.",
    category: "extroversion",
  },
  {
    id: "agreeableness_10",
    backendId: "10",
    question: "I make people feel at ease.",
    category: "agreeableness",
  },
  {
    id: "conscientiousness_10",
    backendId: "10",
    question: "I am exacting in my work.",
    category: "conscientiousness",
  },
  {
    id: "neuroticism_10",
    backendId: "10",
    question: "I often feel blue.",
    category: "neuroticism",
  },
  {
    id: "openness_10",
    backendId: "10",
    question: "I am full of ideas.",
    category: "openness",
  },
];

export type PageName =
  | "gender"
  | "religious-importance"
  | "lgbtq-preference"
  | "age"
  | "location"
  | "therapy-needs";

type StepInfo = {
  component: React.ComponentType;
  title: string;
  getNextStep: (answer?: string) => PageName;
};

export type GeneralQuestionsComponentMap = {
  [key in PageName]: StepInfo;
};

const getNextStep = (
  currentStep: PageName,
  data?: string | undefined,
): PageName => {
  const stepInfo: StepInfo =
    GENERAL_QUESTIONS_COMPONENT_MAP[currentStep as PageName];
  if (stepInfo) {
    return stepInfo.getNextStep(data);
  }
  return "gender";
};

const getPreviousStep = (currentStep: string, stepHistory: string[]) => {
  if (!currentStep || !stepHistory.length) {
    return "/";
  }

  const currentStepIndex = stepHistory.indexOf(currentStep);

  if (currentStepIndex < 0) {
    return `/questions/${stepHistory[stepHistory.length - 1]}`;
  }

  if (currentStepIndex === 0) {
    return "/";
  }

  const previousStep = stepHistory[currentStepIndex - 1];

  return `/questions/${previousStep}`;
};

export { PERSONALITY_TEST_QUESTIONS, getNextStep, getPreviousStep };
