import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { SxProps } from "@mui/material/styles";

type NavigationButtonsProps = {
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
  isNextButtonDisabled?: boolean;
  isPrevButtonDisabled?: boolean;
  sx?: SxProps;
};

const NavigationButtons = ({
  onPrevButtonClick,
  onNextButtonClick,
  isNextButtonDisabled = false,
  isPrevButtonDisabled = false,
  sx = {},
}: NavigationButtonsProps) => {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ ...sx }}>
      <Button
        onClick={onPrevButtonClick}
        disabled={isPrevButtonDisabled}
        variant="outlined"
      >
        Previous
      </Button>
      <Button
        onClick={onNextButtonClick}
        variant="outlined"
        disabled={isNextButtonDisabled}
      >
        Next
      </Button>
    </Stack>
  );
};

export default NavigationButtons;
