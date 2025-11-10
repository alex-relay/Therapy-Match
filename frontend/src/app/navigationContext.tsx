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

const NavigationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [stepHistory, setStepHistory] = useState<string[]>([]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentPathIsHomepage = currentPath === "/";

    if (typeof window !== "undefined" && "sessionStorage" in window) {
      const savedHistory = window.sessionStorage.getItem("stepHistory");
      if (savedHistory && !currentPathIsHomepage) {
        try {
          const parsedSavedHistory = JSON.parse(savedHistory);
          if (
            Array.isArray(parsedSavedHistory) &&
            parsedSavedHistory.every((item) => typeof item === "string")
          ) {
            setStepHistory(parsedSavedHistory);
          }
        } catch (error) {
          console.error(
            "Failed to parse stepHistory from sessionStorage:",
            error,
          );
        }
      }
    }
  }, []);

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
