"use client";

import { Globe, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUI } from "@/lib/ui-context";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale, t } = useUI();

  const currentLabel = locale === "fr" ? "FR" : "AR";

  return (
    <header className="sticky top-0 right-0 left-64 bg-background border-b border-border z-40">
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t.header.adminDashboard}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Globe className="w-4 h-4" />
              <span>{currentLabel}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {isOpen && (
              <div className="absolute right-0 top-12 bg-card border border-border rounded-lg shadow-lg z-50">
                <button
                  className="w-full px-4 py-2 text-left hover:bg-muted text-sm"
                  onClick={() => {
                    setLocale("fr");
                    setIsOpen(false);
                  }}
                >
                  🇫🇷 Français
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-muted text-sm border-t border-border"
                  onClick={() => {
                    setLocale("ar");
                    setIsOpen(false);
                  }}
                >
                  🇲🇦 العربية
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              A
            </div>
            <div>
              <p className="text-sm font-medium">Admin</p>
              <p className="text-xs text-muted-foreground">Directeur</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
