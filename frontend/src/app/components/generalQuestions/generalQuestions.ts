import { GeneralQuestionsComponentMap } from "@/app/utils/utils";
import AgeForm from "./AgeForm";
import GenderForm from "./GenderForm";
import LocationForm from "./LocationForm";
import TherapyNeedsForm from "./TherapyNeedsForm";
import ReligiousPreferenceForm from "./ReligiousPreferenceForm";
import LGBTQPreferenceForm from "./LGBTQPreferenceForm";

const GENERAL_QUESTIONS_COMPONENT_MAP: GeneralQuestionsComponentMap = {
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
      return "age";
    },
  },
  "lgbtq-preference": {
    component: LGBTQPreferenceForm,
    title: "Do you prefer a therapist who is LGBTQ+ informed?",
    getNextStep: () => {
      return "religious-importance";
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

export default GENERAL_QUESTIONS_COMPONENT_MAP;
