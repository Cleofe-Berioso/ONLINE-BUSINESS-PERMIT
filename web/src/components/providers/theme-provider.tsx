"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps & { forcedColorScheme?: "light" | "dark" }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
