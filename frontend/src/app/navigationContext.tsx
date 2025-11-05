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

const NavigationContext = ({ children }: { children: React.ReactNode }) => {
  const [stepHistory, setStepHistory] = useState<string[]>([]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentPathIsHomepage = currentPath === "/";

    if (typeof window !== "undefined" && "sessionStorage" in window) {
      const savedHistory = window.sessionStorage.getItem("stepHistory");
      if (savedHistory && !currentPathIsHomepage) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (
            Array.isArray(parsed) &&
            parsed.every((item) => typeof item === "string")
          ) {
            setStepHistory(parsed);
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

export default NavigationContext;
