import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}

/** Vrai à partir de 1024 px : la sidebar est fixe ; en dessous, elle devient un tiroir. */
export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
}
