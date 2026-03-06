"use client";

import NavigationContextProvider from "@/app/contexts/NavigationContext";
import React from "react";

const FormLayout = ({ children }: { children: React.ReactNode }) => {
  return <NavigationContextProvider>{children}</NavigationContextProvider>;
};

export default FormLayout;
