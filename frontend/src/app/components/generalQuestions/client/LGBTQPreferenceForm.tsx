"use client";

import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "@/app/components/common/OptionsContainers";
import { useState, useContext } from "react";
import NavigationButtons from "@/app/components/common/NavigationButtons";
import { useParams, useRouter } from "next/navigation";
import { usePatchQuestion } from "@/app/api/profile/profile";
import { getNextStep, getPreviousStep, PageName } from "@/app/utils/utils";
import { useNavContext } from "@/app/NavigationContext";
import QuestionFormWrapper from "./QuestionFormWrapper";
import { AnonymousPatientContext } from "./AnonymousPatientContext";

const LGBTQPreferenceForm = () => {
  const router = useRouter();
  const params = useParams();
  const { stepHistory, setStepHistory } = useNavContext();
  const { anonymousPatient } = useContext(AnonymousPatientContext);

  const lgbtqPreferenceValue =
    anonymousPatient?.is_lgbtq_therapist_preference ?? null;

  const [selectedValue, setSelectedValue] = useState<boolean | null>(
    lgbtqPreferenceValue,
  );

  const step = params.step as PageName;
  const nextStep = getNextStep(step);
  const isStepInStepHistory = stepHistory.indexOf(step) >= 0;

  const { mutate: answerMutate } = usePatchQuestion({
    onSuccess: () => {
      if (!isStepInStepHistory) {
        setStepHistory((prevState) => [...prevState, step]);
      }

      router.push(`/questions/${nextStep}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedValue !== anonymousPatient?.is_lgbtq_therapist_preference) {
      answerMutate({
        is_lgbtq_therapist_preference: selectedValue,
      });
    } else {
      if (!isStepInStepHistory) {
        setStepHistory((prevState) => [...prevState, step]);
      }

      router.push(`/questions/${nextStep}`);
    }
  };

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value === "yes" ? true : false);
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <FormControl component={"fieldset"} sx={{ gap: 2 }}>
        <RadioGroup
          name="lgbtqPreference"
          sx={{ gap: 2 }}
          onChange={handleRadioButtonChange}
        >
          <StyledFormControlLabel
            value={"yes"}
            label={"Yes"}
            control={<StyledRadioButton />}
            checked={selectedValue === true}
          />
          <StyledFormControlLabel
            value={"no"}
            label={"No"}
            control={<StyledRadioButton />}
            checked={selectedValue === false}
          />
        </RadioGroup>
        <NavigationButtons
          isNextButtonDisabled={selectedValue === null}
          onPrevButtonClick={() => {
            const previousStep = getPreviousStep(step, stepHistory);
            router.push(previousStep);
          }}
        />
      </FormControl>
    </QuestionFormWrapper>
  );
};

export default LGBTQPreferenceForm;
