"use client";

import PageContainer from "@/app/components/common/PageContainer";
import StyledStack from "@/app/components/common/PageStyledStack";
import AnonymousPatientProvider from "@/app/components/generalQuestions/AnonymousPatientContext";
import NavigationContextProvider from "@/app/navigationContext";
import React from "react";

const FormLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AnonymousPatientProvider>
      <NavigationContextProvider>
        <PageContainer>
          <StyledStack>{children}</StyledStack>
        </PageContainer>
      </NavigationContextProvider>
    </AnonymousPatientProvider>
  );
};

export default FormLayout;
