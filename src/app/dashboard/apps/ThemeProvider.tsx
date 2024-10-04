"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

type Props = Parameters<typeof NextThemeProvider>[0];

export function ThemeProvider(props: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return <NextThemeProvider {...props}>{props.children}</NextThemeProvider>;
}
