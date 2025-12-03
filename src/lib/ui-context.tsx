// src/lib/ui-context.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { messages, type Locale, type Translation } from "./i18n";

type UIContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Translation;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  const setLocale = (l: Locale) => setLocaleState(l);
  const toggleLocale = () =>
    setLocaleState((prev) => (prev === "fr" ? "ar" : "fr"));

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
  }, [locale]);

  return (
    <UIContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        t: messages[locale] as Translation,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider />");
  return ctx;
}
