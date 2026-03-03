"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { SessionProvider } from "next-auth/react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { TherapistNavigationContextProvider } from "./contexts/TherapistNavigationContext";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppRouterCacheProvider>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <TherapistNavigationContextProvider>
              {children}
            </TherapistNavigationContextProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SessionProvider>
    </AppRouterCacheProvider>
  );
}
