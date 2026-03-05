"use client";

import { TherapistNavigationContextProvider } from "@/app/contexts/TherapistNavigationContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <TherapistNavigationContextProvider>
      {children}
    </TherapistNavigationContextProvider>
  );
};

export default Layout;
