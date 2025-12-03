"use client";

import type { ReactNode } from "react";
import { UIProvider } from "@/lib/ui-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { I18nProvider } from "@/providers/i18n-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <UIProvider>
        <div className="flex">
          <Sidebar />
          <div className="ml-64 flex-1 min-h-screen">
            <Header />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </UIProvider>
    </I18nProvider>
  );
}
