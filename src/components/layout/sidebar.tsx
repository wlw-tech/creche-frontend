"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/i18n-provider";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  LayoutDashboard,
  Users,
  Baby,
  FileText,
  Settings,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  submenu?: { label: string; href: string }[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Vue d'ensemble",
    href: "/admin",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Tous les enfants",
    href: "/admin/enfants",
    icon: <Baby className="w-5 h-5" />,
  },
  {
    label: "Toutes les inscriptions",
    href: "/admin/inscriptions",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: "Gestion des classes",
    href: "/admin/classes",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Menu enfant",
    href: "/admin/menus",
    icon: <UtensilsCrossed className="w-5 h-5" />,
  },
  {
    label: "Tous les utilisateurs",
    href: "/admin/utilisateurs",
    icon: <Users className="w-5 h-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label],
    );
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen overflow-y-auto fixed left-0 top-0 pt-6">
      {/* Logo + titre */}
      <div className="px-6 mb-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-transparent">
            <Image
              src="/Group 13.svg"
              alt="Logo Petitspas"
              width={40}
              height={40}
            />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">
              Petitspas
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Admin</p>
          </div>
        </Link>
      </div>

      {/* Liens */}
      <nav className="space-y-1 px-3">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isExpanded = expandedMenus.includes(item.label);

          // 🔹 Cas SANS sous-menu : simple Link clickable
          if (!hasSubmenu) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/30",
                )}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
              </Link>
            );
          }

          // 🔹 Cas AVEC sous-menu
          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() => toggleMenu(item.label)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/30",
                )}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                <Baby
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isExpanded && "rotate-180",
                  )}
                />
              </button>

              {isExpanded && item.submenu && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu.map((subitem) => {
                    const isSubActive = pathname === subitem.href;
                    return (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all",
                          isSubActive
                            ? "bg-primary/20 text-primary-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/20",
                        )}
                      >
                        <span>•</span>
                        {subitem.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4 space-y-2 bg-sidebar">
        <div className="px-4 py-2">
          <LanguageSwitcher currentLocale={useI18n().locale} />
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/30 transition-all">
          <Settings className="w-5 h-5" />
          Paramètres
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
