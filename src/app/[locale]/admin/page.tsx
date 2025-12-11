"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, FileText, Settings, LogOut, Baby } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Locale } from "@/lib/i18n/config";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { apiClient } from "@/lib/api";

export default function AdminPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const currentLocale = resolvedParams.locale;
  const t = useTranslations("admin.dashboard");
  const [loading, setLoading] = useState(true);
  const [pendingRegistrations, setPendingRegistrations] = useState<number | null>(null);
  const [totalChildren, setTotalChildren] = useState<number | null>(null);
  const [totalClasses, setTotalClasses] = useState<number | null>(null);
  const [monthlyEvents, setMonthlyEvents] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || document.cookie.includes("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    async function fetchStats() {
      try {
        const [inscriptionsRes, childrenRes, classesRes, eventsRes] = await Promise.all([
          apiClient.listAdminInscriptions(),
          apiClient.listChildren(1, 1000),
          apiClient.listClasses(),
          apiClient.listAdminEvents({ page: 1, pageSize: 100 }),
        ]);

        const insPayload = inscriptionsRes.data;
        const insTotal =
          (insPayload && (insPayload.total ?? insPayload.items?.length ?? insPayload.data?.length)) ?? 0;
        setPendingRegistrations(insTotal);

        const childrenPayload = childrenRes.data;
        const childrenItems: any[] = Array.isArray(childrenPayload?.data)
          ? childrenPayload.data
          : Array.isArray(childrenPayload?.items)
          ? childrenPayload.items
          : Array.isArray(childrenPayload)
          ? childrenPayload
          : [];
        setTotalChildren(childrenItems.length);

        const classesPayload = classesRes.data;
        const classesItems: any[] = Array.isArray(classesPayload?.data)
          ? classesPayload.data
          : Array.isArray(classesPayload?.items)
          ? classesPayload.items
          : Array.isArray(classesPayload)
          ? classesPayload
          : [];
        setTotalClasses(classesItems.length);

        const eventsPayload = eventsRes.data;
        const eventsItems: any[] = Array.isArray(eventsPayload?.data)
          ? eventsPayload.data
          : Array.isArray(eventsPayload?.items)
          ? eventsPayload.items
          : Array.isArray(eventsPayload)
          ? eventsPayload
          : [];
        setMonthlyEvents(eventsItems.length);
      } catch (err) {
        console.error("[Admin/Dashboard] Error loading inscriptions stats", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  const stats = [
    {
      title: t("totalChildren"),
      value: totalChildren === null ? "…" : String(totalChildren),
      change: "",
      icon: Baby,
      color: "text-blue-600",
    },
    {
      title: t("pendingRegistrations"),
      value: pendingRegistrations === null ? "…" : String(pendingRegistrations),
      change: "",
      icon: FileText,
      color: "text-yellow-600",
    },
    {
      title: t("monthlyEvents"),
      value: monthlyEvents === null ? "…" : String(monthlyEvents),
      change: "",
      icon: Calendar,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SidebarNew currentLocale={currentLocale} />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Baby className="h-8 w-8 text-primary mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">{t("title")}</h1>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSwitcher currentLocale={currentLocale} />
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </Card>
            ))}
          </div>

          {/* Overview / Charter section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-lg font-semibold mb-2">{t("overviewIntroTitle")}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("overviewIntroDescription")}
              </p>
              <h3 className="text-sm font-semibold mb-2">{t("overviewIntroCharterTitle")}</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>{t("overviewIntroCharterItem1")}</li>
                <li>{t("overviewIntroCharterItem2")}</li>
                <li>{t("overviewIntroCharterItem3")}</li>
              </ul>
            </Card>

            {/* Placeholder for future backend-driven recent activities */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{t("recentActivities")}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("recentActivitiesEmpty")}
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
