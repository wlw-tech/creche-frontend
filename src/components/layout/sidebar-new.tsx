"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  LayoutDashboard,
  Users,
  Baby,
  FileText,
  Settings,
  LogOut,
  UtensilsCrossed,
  Calendar,
} from "lucide-react";

interface SidebarItem {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
  submenu?: { labelKey: string; href: string }[];
}

export function SidebarNew({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const t = useTranslations('sidebar');

  const sidebarItems: SidebarItem[] = [
    {
      labelKey: "overview",
      href: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      labelKey: "children",
      href: "/admin/enfants",
      icon: <Baby className="w-5 h-5" />,
    },
    {
      labelKey: "registrations",
      href: "/admin/inscriptions",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      labelKey: "classes",
      href: "/admin/classes",
      icon: <Users className="w-5 h-5" />,
    },
    {
      labelKey: "teachers",
      href: "/admin/teachers",
      icon: <Users className="w-5 h-5" />,
    },
    {
      labelKey: "menus",
      href: "/admin/menus",
      icon: <UtensilsCrossed className="w-5 h-5" />,
    },
    {
      labelKey: "events",
      href: "/admin/events",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      labelKey: "users",
      href: "/admin/utilisateurs",
      icon: <Users className="w-5 h-5" />,
    },
    {
      labelKey: "profile",
      href: "/admin/profile",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const toggleMenu = (labelKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(labelKey) ? prev.filter((m) => m !== labelKey) : [...prev, labelKey],
    );
  };

  const handleLogout = () => {
    // Supprimer les cookies/token simples côté client
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    try {
      localStorage.removeItem("token");
    } catch {
      // ignore
    }

    const loginPath = `/${currentLocale}/auth/login-user`;
    router.push(loginPath);
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen overflow-y-auto fixed left-0 top-0 pt-6">
      {/* Logo + titre */}
      <div className="px-6 mb-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">
              🏠
            </span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">
              Le Nido
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
          const isExpanded = expandedMenus.includes(item.labelKey);

          // 🔹 Cas SANS sous-menu : simple Link clickable
          if (!hasSubmenu) {
            return (
              <Link
                key={item.labelKey}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/30",
                )}
              >
                {item.icon}
                <span className="flex-1 text-left">{t(item.labelKey)}</span>
              </Link>
            );
          }

          // 🔹 Cas AVEC sous-menu
          return (
            <div key={item.labelKey}>
              <button
                type="button"
                onClick={() => toggleMenu(item.labelKey)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/30",
                )}
              >
                {item.icon}
                <span className="flex-1 text-left">{t(item.labelKey)}</span>
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
                        {t(subitem.labelKey)}
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
          <LanguageSwitcher currentLocale={currentLocale as any} />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}
