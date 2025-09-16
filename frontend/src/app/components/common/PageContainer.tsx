"use client";
import { ReactNode } from "react";
import Stack from "@mui/material/Stack";
import { SxProps } from "@mui/material/styles";

type PageContainerProps = {
  children: ReactNode;
  sx?: SxProps;
};

const PageContainer = ({ children, sx, ...rest }: PageContainerProps) => {
  return (
    <Stack
      sx={{
        margin: "auto",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Stack>
  );
};

export default PageContainer;
