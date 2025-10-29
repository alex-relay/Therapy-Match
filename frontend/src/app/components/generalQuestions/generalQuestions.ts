import { GeneralQuestionsComponentMap } from "@/app/utils/utils";
import AgeForm from "./AgeForm";
import GenderForm from "./GenderForm";
import LocationForm from "./LocationForm";
import TherapyNeedsForm from "./TherapyNeedsForm";
import ReligionForm from "./ReligionForm";

const GENERAL_QUESTIONS_COMPONENT_MAP: GeneralQuestionsComponentMap = {
  gender: {
    component: GenderForm,
    title: "What is your gender identity?",
    getNextStep: () => {
      return "religion";
    },
  },
  religion: {
    component: ReligionForm,
    title: "What religion do you identify with?",
    getNextStep: (answer = "") => {
      if (answer === "prefer_not_to_say" || answer === "not_applicable") {
        return "age";
      }
      return "religious-importance";
    },
  },
  "religious-importance": {
    component: null,
    title:
      "How important is it to have a therapist who shares your religious beliefs?",
    getNextStep: () => {
      return "age";
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
      return "age";
    },
  },
};

export default GENERAL_QUESTIONS_COMPONENT_MAP;
