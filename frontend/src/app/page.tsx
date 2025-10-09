"use client";
import Typography from "@mui/material/Typography";
import PageContainer from "./components/common/PageContainer";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import StyledStack from "./components/common/PageStyledStack";
import { useRouter } from "next/navigation";
import { styled } from "@mui/material/styles";
import { useCreateAnonymousSession } from "../app/api/users/users";

const StyledCard = styled(Card)(({ theme }) => ({
  ":hover": {
    cursor: "pointer",
    transform: "scale(1.05)",
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
    backgroundColor: theme.palette.action.hover,
  },
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "150px",
  width: "200px",
}));

export default function Home() {
  const router = useRouter();

  const { mutate: anonymousSessionMutate } = useCreateAnonymousSession({
    onSuccess: () => {
      router.push("/questions/1");
    },
  });

  return (
    <PageContainer>
      <StyledStack>
        <Typography variant="h3">
          What type of therapy are you looking for?
        </Typography>
        <StyledCard
          onClick={() => {
            anonymousSessionMutate();
          }}
          variant="outlined"
          data-testid="myself-tile"
        >
          <CardHeader title="Myself" />
          <CardMedia
            component="img"
            height="100px"
            src="/globe.svg"
            alt="globe"
          />
        </StyledCard>
      </StyledStack>
    </PageContainer>
  );
}
