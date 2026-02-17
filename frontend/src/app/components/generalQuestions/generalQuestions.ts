import {
  AnonymousQuestionsComponentMap,
  TherapistQuestionsComponentMap,
} from "@/app/utils/utils";
import AgeForm from "./client/AgeForm";
import GenderForm from "./client/GenderForm";
import LocationForm from "./client/LocationForm";
import TherapyNeedsForm from "./client/TherapyNeedsForm";
import ReligiousPreferenceForm from "./client/ReligiousPreferenceForm";
import LGBTQPreferenceForm from "./client/LGBTQPreferenceForm";

const ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP: AnonymousQuestionsComponentMap =
  {
    gender: {
      component: GenderForm,
      title: "What is your gender identity?",
      getNextStep: () => {
        return "religious-importance";
      },
    },
    "religious-importance": {
      component: ReligiousPreferenceForm,
      title: "Is it important to have a therapist who is spiritual?",
      getNextStep: () => {
        return "lgbtq-preference";
      },
    },
    "lgbtq-preference": {
      component: LGBTQPreferenceForm,
      title: "Do you prefer a therapist who is LGBTQ+ informed?",
      getNextStep: () => {
        return "age"; // or return the appropriate terminal/next step
      },
    },
    age: {
      component: AgeForm,
      title: "What is your age?",
      getNextStep: () => {
        return "location";
      },
    },
    location: {
      component: LocationForm,
      title: "What is your postal code?",
      getNextStep: () => {
        return "therapy-needs";
      },
    },
    "therapy-needs": {
      component: TherapyNeedsForm,
      title: "What led you to consider therapy today?",
      getNextStep: () => {
        return "lgbtq-preference";
      },
    },
  };

const THERAPIST_QUESTIONS_COMPONENT_MAP: TherapistQuestionsComponentMap = {
  age: {
    component: AgeForm,
    title: "What is your age?",
    getNextStep: () => "location",
  },
  location: {
    component: LocationForm,
    title: "What is your postal code?",
    getNextStep: () => "gender",
  },
  gender: {
    component: GenderForm,
    title: "What is your gender identity?",
    getNextStep: () => "specializations",
  },
  specializations: {
    component: null,
    title: "What are your therapist specializations?",
    getNextStep: () => "",
  },
  lgbtq: {
    component: null,
    title:
      "Are you LGBTQ informed and do you provide therapeutic services to the LGBTQ population?",
    getNextStep: () => "",
  },
  "service-types": {
    component: null,
    title:
      "Do you offer only in-person sessions, remote sessions, or a mix of both?",
    getNextStep: () => "",
  },
};

export {
  ANONYMOUS_SESSION_GENERAL_QUESTIONS_COMPONENT_MAP,
  THERAPIST_QUESTIONS_COMPONENT_MAP,
};
