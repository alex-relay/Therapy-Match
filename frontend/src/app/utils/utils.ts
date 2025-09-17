export type QuestionOptions = {
  agree: number;
  slightly_agree: number;
  neutral: number;
  disagree: number;
  slightly_disagree: number;
};

export type PersonalityTestQuestionAndAnswers = {
  question: string;
  category: string;
  answer: number | null;
};

const PERSONALITY_TEST_QUESTIONS: PersonalityTestQuestionAndAnswers[] = [
  {
    question: "I am the life of the party.",
    category: "extraversion",
    answer: null,
  },
  {
    question: "I feel little concern for others.",
    category: "agreeableness",
    answer: null,
  },
  {
    question: "I am always prepared.",
    category: "conscientiousness",
    answer: null,
  },
  {
    question: "I get stressed out easily.",
    category: "neuroticism",
    answer: null,
  },
  { question: "I have a rich vocabulary.", category: "openness", answer: null },
  { question: "I don't talk a lot.", category: "extraversion", answer: null },
  {
    question: "I am interested in people.",
    category: "agreeableness",
    answer: null,
  },
  {
    question: "I leave my belongings around.",
    category: "conscientiousness",
    answer: null,
  },
  {
    question: "I am relaxed most of the time.",
    category: "neuroticism",
    answer: null,
  },
  {
    question: "I have difficulty understanding abstract ideas.",
    category: "openness",
    answer: null,
  },
  {
    question: "I feel comfortable around people.",
    category: "extraversion",
    answer: null,
  },
  { question: "I insult people.", category: "agreeableness", answer: null },
  {
    question: "I pay attention to details.",
    category: "conscientiousness",
    answer: null,
  },
  { question: "I worry about things.", category: "neuroticism", answer: null },
  {
    question: "I have a vivid imagination.",
    category: "openness",
    answer: null,
  },
  {
    question: "I keep in the background.",
    category: "extraversion",
    answer: null,
  },
  {
    question: "I sympathize with others' feelings.",
    category: "agreeableness",
    answer: null,
  },
  {
    question: "I make a mess of things.",
    category: "conscientiousness",
    answer: null,
  },

  { question: "I seldom feel blue.", category: "neuroticism", answer: null },
  {
    question: "I am not interested in abstract ideas.",
    category: "openness",
    answer: null,
  },
  {
    question: "I start conversations.",
    category: "extraversion",
    answer: null,
  },
  {
    question: "I am not interested in other people's problems.",
    category: "agreeableness",
    answer: null,
  },
  {
    question: "I get chores done right away.",
    category: "conscientiousness",
    answer: null,
  },
  { question: "I am easily disturbed.", category: "neuroticism", answer: null },
  { question: "I have excellent ideas.", category: "openness", answer: null },
  { question: "I have little to say.", category: "extraversion", answer: null },
  { question: "I have a soft heart.", category: "agreeableness", answer: null },
  {
    question: "I often forget to put things back in their proper place.",
    category: "conscientiousness",
    answer: null,
  },
  { question: "I get upset easily.", category: "neuroticism", answer: null },
  {
    question: "I do not have a good imagination.",
    category: "openness",
    answer: null,
  },
  {
    question: "I talk to a lot of different people at parties.",
    category: "extraversion",
    answer: null,
  },
  {
    question: "I am not really interested in others.",
    category: "agreeableness",
    answer: null,
  },
  { question: "I like order.", category: "conscientiousness", answer: null },
  {
    question: "I change my mood a lot.",
    category: "neuroticism",
    answer: null,
  },
  {
    question: "I am quick to understand things.",
    category: "openness",
    answer: null,
  },
  {
    question: "I don't like to draw attention to myself.",
    category: "extraversion",
    answer: null,
  },
  {
    question: "I take time out for others.",
    category: "agreeableness",
    answer: null,
  },
  {
    question: "I shirk my duties.",
    category: "conscientiousness",
    answer: null,
  },
  {
    question: "I have frequent mood swings.",
    category: "neuroticism",
    answer: null,
  },
  { question: "I use difficult words.", category: "openness", answer: null },
  {
    question: "I don't mind being the center of attention.",
    category: "extraversion",
    answer: null,
  },
  {
    question: "I feel others' emotions.",
    category: "agreeableness",
    answer: null,
  },
  {
    question: "I follow a schedule.",
    category: "conscientiousnes",
    answer: null,
  },
  {
    question: "I get irritated easily.",
    category: "neuroticism",
    answer: null,
  },
  {
    question: "I spend time reflecting on things.",
    category: "openness",
    answer: null,
  },
  {
    question: "I am quiet around strangers.",
    category: "extraversion",
    answer: null,
  },
  {
    question: "I make people feel at ease.",
    category: "agreeableness",
    answer: null,
  },
  {
    question: "I am exacting in my work.",
    category: "conscientiousnes",
    answer: null,
  },
  { question: "I often feel blue.", category: "neuroticism", answer: null },
  { question: "I am full of ideas.", category: "openness", answer: null },
];

export { PERSONALITY_TEST_QUESTIONS };
