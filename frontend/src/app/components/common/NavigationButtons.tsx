import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { SxProps } from "@mui/material/styles";

type NavigationButtonsProps = {
  onPrevButtonClick: () => void;
  isNextButtonDisabled?: boolean;
  isPrevButtonDisabled?: boolean;
  sx?: SxProps;
  onNextButtonClick?: () => void;
};

const NavigationButtons = ({
  onPrevButtonClick,
  onNextButtonClick,
  isNextButtonDisabled = false,
  isPrevButtonDisabled = false,
  sx = {},
}: NavigationButtonsProps) => {
  return (
    <Stack
      direction="row"
      width="100%"
      justifyContent="space-between"
      sx={{ ...sx }}
    >
      <Button
        onClick={onPrevButtonClick}
        disabled={isPrevButtonDisabled}
        variant="outlined"
        type="button"
        sx={{
          width: "100px",
        }}
      >
        Previous
      </Button>
      <Button
        variant="outlined"
        disabled={isNextButtonDisabled}
        type="submit"
        sx={{
          width: "100px",
        }}
        onClick={onNextButtonClick}
      >
        Next
      </Button>
    </Stack>
  );
};

export default NavigationButtons;
