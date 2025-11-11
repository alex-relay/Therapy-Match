"use client";

import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

type NavContextType = {
  stepHistory: string[];
  setStepHistory: Dispatch<SetStateAction<string[]>>;
};

export const NavContext = createContext<NavContextType>({
  stepHistory: [],
  setStepHistory: () => {},
});

const getInitialHistory = (): string[] => {
  if (typeof window === "undefined" || !("sessionStorage" in window)) {
    return [];
  }

  const currentPath = window.location.pathname;
  const currentPathIsHomepage = currentPath === "/";

  if (currentPathIsHomepage) {
    window.sessionStorage.removeItem("stepHistory"); // Clear storage on homepage
    return [];
  }

  const savedHistory = window.sessionStorage.getItem("stepHistory");
  if (savedHistory) {
    try {
      const parsedSavedHistory = JSON.parse(savedHistory);
      if (
        Array.isArray(parsedSavedHistory) &&
        parsedSavedHistory.every((item) => typeof item === "string")
      ) {
        return parsedSavedHistory;
      }
    } catch (error) {
      console.error("Failed to parse stepHistory from sessionStorage:", error);
    }
  }

  return [];
};

export const NavigationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [stepHistory, setStepHistory] = useState<string[]>(getInitialHistory);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentPathIsHomepage = currentPath === "/";

    if (
      typeof window !== "undefined" &&
      "sessionStorage" in window &&
      !currentPathIsHomepage
    ) {
      sessionStorage.setItem("stepHistory", JSON.stringify(stepHistory));
    }
  }, [stepHistory]);

  return (
    <NavContext value={{ stepHistory, setStepHistory }}>{children}</NavContext>
  );
};

export default NavigationContextProvider;
