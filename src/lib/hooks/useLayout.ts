import { useEffect } from "react";
import { LayoutState, initialLayout, useLayoutContext } from "../contexts/layout-context";

export function useLayout(props: LayoutState) {
  const { setLayout } = useLayoutContext();
  useEffect(() => {
    setLayout(props);
    // return () => {
    //   setLayout(initialLayout);
    // };
  }, []);
}
