import * as React from "react";
import Stack from "@mui/material/Stack";
import SignInCard from "./SignIn";
import Content from "./Content";

export default function SignInSide({ csrfToken }: { csrfToken: string }) {
  return (
    <Stack
      direction={{ xs: "column-reverse", md: "row" }}
      sx={{
        justifyContent: "center",
        p: { xs: 2, sm: 0 },
        m: "auto",
        width: "100%",
        height: "100%",
      }}
    >
      <Content />
      <SignInCard csrfToken={csrfToken} />
    </Stack>
  );
}
