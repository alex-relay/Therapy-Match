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
import { useRouter } from "next/navigation";

type NavContextType = {
  stepHistory: PageName[];
  setStepHistory: Dispatch<SetStateAction<PageName[]>>;
  goToPreviousStep: (currentStep: PageName) => void;
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
  const router = useRouter();
  const goToPreviousStep = (currentStep: PageName): void => {
    if (!currentStep || !stepHistory.length) {
      router.push("/");
      return;
    }

    const currentStepIndex = stepHistory.indexOf(currentStep);

    if (currentStepIndex < 0) {
      router.push(`/questions/${stepHistory[stepHistory.length - 1]}`);
      return;
    }

    if (currentStepIndex === 0) {
      router.push("/");
      return;
    }

    const previousStep = stepHistory[currentStepIndex - 1];

    router.push(`/questions/${previousStep}`);
  };

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
    <NavContext.Provider
      value={{ stepHistory, setStepHistory, goToPreviousStep }}
    >
      {children}
    </NavContext.Provider>
  );
};

export default NavigationContextProvider;
