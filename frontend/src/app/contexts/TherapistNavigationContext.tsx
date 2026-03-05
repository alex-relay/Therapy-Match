import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { TherapistQuestionStepName } from "../utils/utils";

type NavContextType = {
  therapistProfileStepHistory: TherapistQuestionStepName[];
  setTherapistProfileStepHistory: Dispatch<
    SetStateAction<TherapistQuestionStepName[]>
  >;
};

export const TherapistNavContext = createContext<NavContextType>({
  therapistProfileStepHistory: [],
  setTherapistProfileStepHistory: () => {},
});

export const useNavContext = () => {
  const currentNavContext = useContext(TherapistNavContext);

  if (!currentNavContext) {
    throw new Error(
      "useNavContext has to be used within <NavContext.Provider>",
    );
  }

  return currentNavContext;
};

const getInitialHistory = (): TherapistQuestionStepName[] => {
  if (typeof window === "undefined" || !("sessionStorage" in window)) {
    return [];
  }

  const currentPath = window.location.pathname;
  const currentPathIsHomepage = currentPath === "/";

  if (currentPathIsHomepage) {
    window.sessionStorage.removeItem("therapistProfileStepHistory");
    return [];
  }

  const savedHistory = window.sessionStorage.getItem(
    "therapistProfileStepHistory",
  );
  if (savedHistory) {
    try {
      const parsedSavedHistory: TherapistQuestionStepName[] =
        JSON.parse(savedHistory);
      if (Array.isArray(parsedSavedHistory)) {
        return parsedSavedHistory;
      }
    } catch (error) {
      console.error("Failed to parse stepHistory from sessionStorage:", error);
    }
  }

  return [];
};

export const TherapistNavigationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [therapistProfileStepHistory, setTherapistProfileStepHistory] =
    useState<TherapistQuestionStepName[]>(getInitialHistory);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentPathIsHomepage = currentPath === "/";

    if (
      !currentPathIsHomepage &&
      typeof window === "undefined" &&
      !("sessionStorage" in window)
    ) {
      sessionStorage.setItem(
        "therapistProfileStepHistory",
        JSON.stringify(therapistProfileStepHistory),
      );
    }
  }, [therapistProfileStepHistory]);

  return (
    <TherapistNavContext.Provider
      value={{ therapistProfileStepHistory, setTherapistProfileStepHistory }}
    >
      {children}
    </TherapistNavContext.Provider>
  );
};
