import { useState } from "react";
import { TherapistStepComponentProps } from "@/app/utils/utils";
import QuestionFormWrapper from "../client/QuestionFormWrapper";
import FormGroup from "@mui/material/FormGroup";
import {
  TherapistSpecializationsOptions,
  TherapyNeedsOptionsAndSpecializationsMap,
} from "@/app/api/profile/profile";
import Box from "@mui/material/Box";
import { StyledFormControlLabel } from "../../common/OptionsContainers";
import Checkbox from "@mui/material/Checkbox";
import NavigationButtons from "../../common/NavigationButtons";
import { useRouter } from "next/navigation";

const TherapistSpecializations = ({
  step,
  onAnswerMutate,
  entity,
  nextStep,
  stepHistory,
  onStepHistoryChange,
  previousStep,
}: TherapistStepComponentProps) => {
  const router = useRouter();
  const specializationsValue = entity.specializations;

  const [specializations, setSpecializations] = useState<
    TherapistSpecializationsOptions[]
  >(specializationsValue ?? []);

  const handleOptionClick = (
    event: React.ChangeEvent<HTMLInputElement>,
    isChecked: boolean,
  ) => {
    const option = event.target.value;

    setSpecializations((prevState) => {
      if (isChecked) {
        return prevState.filter((type) => type !== option);
      }
      return [...prevState, option as TherapistSpecializationsOptions];
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isStateMatchingSavedNeeds = specializations.every(
      (need) => specializationsValue?.includes(need),
    );

    if (
      !isStateMatchingSavedNeeds ||
      specializations.length !== specializationsValue?.length
    ) {
      onAnswerMutate({ specializations });
      return;
    }

    if (!stepHistory.includes(step)) {
      onStepHistoryChange((prev) => [...prev, step]);
      router.push(nextStep);
    }
  };

  const isPrevButtonDisabled =
    stepHistory.indexOf(step) === 0 || stepHistory.length === 0;

  return (
    <QuestionFormWrapper handleSubmit={handleSubmit}>
      <FormGroup
        row
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {Object.entries(TherapyNeedsOptionsAndSpecializationsMap).map(
          ([key, value]) => {
            const isChecked = specializations.includes(
              key as TherapistSpecializationsOptions,
            );
            return (
              <Box
                width="300px"
                key={key}
                sx={{
                  textAlign: "center",
                }}
              >
                <StyledFormControlLabel
                  control={
                    <Checkbox
                      checked={isChecked}
                      value={key}
                      onChange={(event) => handleOptionClick(event, isChecked)}
                      name={key}
                      sx={{
                        display: "none",
                      }}
                    />
                  }
                  checked={isChecked}
                  label={value}
                />
              </Box>
            );
          },
        )}
      </FormGroup>
      <NavigationButtons
        onPrevButtonClick={() => {
          router.push(previousStep);
        }}
        isNextButtonDisabled={false}
        isPrevButtonDisabled={isPrevButtonDisabled}
      />
    </QuestionFormWrapper>
  );
};

export default TherapistSpecializations;
