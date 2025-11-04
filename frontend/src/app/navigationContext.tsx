import { createContext, useState, Dispatch, SetStateAction } from "react";

type NavContextType = {
  history: string[];
  setHistory: Dispatch<SetStateAction<string[]>>;
};

export const NavContext = createContext<NavContextType>({
  history: [] as string[],
  setHistory: () => {},
});

const NavigationContext = ({ children }: { children: React.ReactNode }) => {
  const [history, setHistory] = useState<string[]>([]);

  return <NavContext value={{ history, setHistory }}>{children}</NavContext>;
};

export default NavigationContext;
