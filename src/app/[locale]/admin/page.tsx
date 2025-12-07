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

  useEffect(() => {
    const token = localStorage.getItem("token") || document.cookie.includes("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    async function fetchStats() {
      try {
        const res = await apiClient.listAdminInscriptions();
        const total = (res.data && (res.data.total ?? res.data.items?.length)) ?? 0;
        setPendingRegistrations(total);
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
      value: "45",
      change: "+12%",
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
      title: t("todayAttendance"),
      value: "38",
      change: "+5%",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: t("monthlyEvents"),
      value: "12",
      change: "+3%",
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

          {/* Quick Actions & Recent Activities placeholders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t("quickActions")}</h2>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  {t("manageChildren")}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  {t("viewRegistrations")}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("manageCalendar")}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  {t("crecheSettings")}
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t("recentActivities")}</h2>
              <div className="space-y-3">
                <div className="flex items-center justify_between py-2 border-b">
                  <div>
                    <p className="font-medium">{t("newRegistration")}</p>
                    <p className="text-sm text-gray-500">Il y a 2 heures</p>
                  </div>
                  <span className="text-sm text-blue-600">{t("toProcess")}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{t("attendanceUpdate")}</p>
                    <p className="text-sm text-gray-500">Il y a 4 heures</p>
                  </div>
                  <span className="text-sm text-green-600">{t("completed")}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{t("newParentMessage")}</p>
                    <p className="text-sm text-gray-500">Il y a 6 heures</p>
                  </div>
                  <span className="text-sm text-yellow-600">{t("unread")}</span>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
