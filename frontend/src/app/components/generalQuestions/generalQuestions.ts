import AgeForm from "./AgeForm";
import GenderForm from "./GenderForm";
import LocationForm from "./LocationForm";
import TherapyNeeds from "./TherapyNeedsForm";

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

export default GENERAL_QUESTIONS_COMPONENT_MAP;
