import { createContext, useContext, Dispatch, useState, SetStateAction } from "react";

export type LayoutState = {
  hideNavbar?: boolean;
  navbarTitle?: string;
  noLayout?: boolean;
};

type LayoutContextValue = LayoutState & {
  setLayout: Dispatch<SetStateAction<LayoutState>>;
};

export const initialLayout: LayoutState = {
  hideNavbar: false,
  navbarTitle: "",
  noLayout: false,
};

const LayoutContext = createContext<LayoutContextValue>({
  ...initialLayout,
  setLayout: () => {},
});

export const useLayoutContext = () => useContext(LayoutContext);

export function LayoutContextProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState(initialLayout);

  return (
    <LayoutContext.Provider value={{ ...layout, setLayout }}>{children}</LayoutContext.Provider>
  );
}
