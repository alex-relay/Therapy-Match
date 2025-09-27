import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";
import Radio from "@mui/material/Radio";

const StyledFormControlLabel = styled(FormControlLabel)(
  ({ theme, checked }) => ({
    border: "1px solid",
    borderColor: "black",
    "& .MuiRadio-root": {
      padding: 0,
    },
    padding: theme.spacing(2),
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 0,
    marginRight: 0,
    ":hover": {
      cursor: "pointer",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: checked ? null : theme.palette.action.hover,
    },
  }),
);

const StyledRadioButton = styled(Radio)(() => ({
  display: "none",
}));

export { StyledFormControlLabel, StyledRadioButton };
