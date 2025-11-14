"use client";

import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  useContext,
} from "react";
import { PageName } from "./utils/utils";

type NavContextType = {
  stepHistory: PageName[];
  setStepHistory: Dispatch<SetStateAction<PageName[]>>;
};

export const NavContext = createContext<NavContextType | null>(null);

export const useNavContext = () => {
  const currentNavContext = useContext(NavContext);

  if (!currentNavContext) {
    throw new Error(
      "useNavContext has to be used within <NavContext.Provider>",
    );
  }

  return currentNavContext;
};

const getInitialHistory = (): PageName[] => {
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
      const parsedSavedHistory: PageName[] = JSON.parse(savedHistory);
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
  const [stepHistory, setStepHistory] = useState<PageName[]>(getInitialHistory);

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
    <NavContext.Provider value={{ stepHistory, setStepHistory }}>
      {children}
    </NavContext.Provider>
  );
};

export default NavigationContextProvider;
