"use client";

import { useState } from "react";
import RadioGroup from "@mui/material/RadioGroup";
import {
  StyledFormControlLabel,
  StyledRadioButton,
} from "../../common/OptionsContainers";
import { useParams, useRouter } from "next/navigation";
import { usePatchAnonymousQuestion } from "@/app/api/profile/profile";
import {
  getAnonymousSessionNextStep,
  AnonymousQuestionsStepName,
} from "@/app/utils/utils";
import { FormControl } from "@mui/material";
import NavigationButtons from "@/app/components/common/NavigationButtons";
import QuestionFormWrapper from "./QuestionFormWrapper";

const OPTIONS_MAP = {
  jewish: "Jewish",
  muslim: "Muslim",
  hindu: "Hindu",
  buddhist: "Buddhist",
  christian: "Christian",
  sikh: "Sikh",
  not_applicable: "Not applicable",
  prefer_not_to_say: "Prefer not to say",
} as const;

type ReligionFormValues = keyof typeof OPTIONS_MAP;

export default function ReligionForm() {
  const [selectedValue, setSelectedValue] = useState<ReligionFormValues | null>(
    null,
  );
  const router = useRouter();
  const params = useParams();
  const step = params.step as AnonymousQuestionsStepName;

  const { mutate: answerMutate } = usePatchAnonymousQuestion({
    onSuccess: () => {
      const nextStep = getAnonymousSessionNextStep(step);
      router.push(`/questions/${nextStep}`);
    },
  });

  const handleRadioButtonChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedValue(event.target.value as ReligionFormValues);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedValue) {
      answerMutate({ religion: selectedValue });
    }
  };

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <FormControl>
        <RadioGroup
          aria-labelledby="religion-question-label"
          name="selectedReligion"
          sx={{ gap: 2 }}
          onChange={handleRadioButtonChange}
        >
          {Object.entries(OPTIONS_MAP).map(([key, value]) => (
            <StyledFormControlLabel
              key={key}
              label={value}
              value={key}
              control={<StyledRadioButton />}
              checked={selectedValue === key}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <NavigationButtons
        isNextButtonDisabled={!selectedValue}
        onPrevButtonClick={() => {
          router.push(`/questions/gender`);
        }}
      />
    </QuestionFormWrapper>
  );
}
