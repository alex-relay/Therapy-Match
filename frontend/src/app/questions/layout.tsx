"use client";

import AnonymousPatientProvider from "@/app/components/generalQuestions/client/AnonymousPatientContext";
import NavigationContextProvider from "@/app/contexts/NavigationContext";
import React from "react";

const FormLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AnonymousPatientProvider>
      <NavigationContextProvider>{children}</NavigationContextProvider>
    </AnonymousPatientProvider>
  );
};

export default FormLayout;
