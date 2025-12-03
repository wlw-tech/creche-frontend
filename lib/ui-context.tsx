"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Locale = "fr" | "ar";

type UiContextValue = {
  locale: Locale;
  toggleLocale: () => void;
  isDark: boolean;
  toggleDark: () => void;
};

const UiContext = createContext<UiContextValue | undefined>(undefined);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("fr");
  const [isDark, setIsDark] = useState(false);

  // appliquer dir + dark sur <html>
  useEffect(() => {
    const root = document.documentElement;

    // langue & direction
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";

    // dark mode
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [locale, isDark]);

  const toggleLocale = () => setLocale((prev) => (prev === "fr" ? "ar" : "fr"));
  const toggleDark = () => setIsDark((prev) => !prev);

  return (
    <UiContext.Provider value={{ locale, toggleLocale, isDark, toggleDark }}>
      {children}
    </UiContext.Provider>
  );
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside UiProvider");
  return ctx;
}
