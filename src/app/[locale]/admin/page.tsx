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
  const [presenceStats, setPresenceStats] = useState<any[] | null>(null);
  const [inscriptionStats, setInscriptionStats] = useState<any[] | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[] | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || document.cookie.includes("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    async function fetchStats() {
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const fromMonthly = new Date(currentYear, now.getMonth(), 1);
        const toMonthly = new Date(currentYear, now.getMonth() + 1, 0);

        const oneMonthAhead = new Date(now);
        oneMonthAhead.setMonth(oneMonthAhead.getMonth() + 1);

        const [
          inscriptionsRes,
          childrenRes,
          classesRes,
          eventsRes,
          presencesRes,
          inscriptionStatsRes,
          upcomingEventsRes,
        ] = await Promise.all([
          apiClient.listAdminInscriptions(),
          apiClient.listChildren(1, 1000),
          apiClient.listClasses(),
          apiClient.listAdminEvents({ page: 1, pageSize: 100 }),
          apiClient.listDashboardPresences({
            from: fromMonthly.toISOString().slice(0, 10),
            to: toMonthly.toISOString().slice(0, 10),
          }),
          apiClient.listDashboardInscriptions({ year: currentYear }),
          apiClient.listDashboardUpcomingEvents({
            from: now.toISOString(),
            to: oneMonthAhead.toISOString(),
          }),
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

        // Charts data
        const presPayload = presencesRes.data;
        const presItems: any[] = Array.isArray(presPayload?.items)
          ? presPayload.items
          : [];
        setPresenceStats(presItems);

        const inscStatsPayload = inscriptionStatsRes.data;
        const inscItems: any[] = Array.isArray(inscStatsPayload?.items)
          ? inscStatsPayload.items
          : [];
        setInscriptionStats(inscItems);

        const upcomingPayload = upcomingEventsRes.data;
        const upcomingItems: any[] = Array.isArray(upcomingPayload?.items)
          ? upcomingPayload.items
          : [];
        setUpcomingEvents(upcomingItems);
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

  const maxPresenceTotal =
    presenceStats && presenceStats.length > 0
      ? Math.max(
          ...presenceStats.map((d: any) =>
            (d.present || 0) + (d.absent || 0) + (d.justifie || 0),
          ),
        )
      : 0;

  const maxInscriptionsTotal =
    inscriptionStats && inscriptionStats.length > 0
      ? Math.max(...inscriptionStats.map((m: any) => m.total || 0))
      : 0;

  // Présence du jour: vérifier si au moins une présence/absence est enregistrée aujourd'hui
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPresence =
    presenceStats && presenceStats.length > 0
      ? presenceStats.find((d: any) => d.date === todayStr)
      : null;
  const todayTotal = todayPresence
    ? (todayPresence.present || 0) + (todayPresence.absent || 0) + (todayPresence.justifie || 0)
    : 0;
  const hasTodayPresence = todayTotal > 0;

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
          {/* Today presence status */}
          <div className="mb-6">
            <Card className={
              hasTodayPresence
                ? "p-4 border border-emerald-200 bg-emerald-50"
                : "p-4 border border-amber-200 bg-amber-50"
            }>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Présence du jour
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    {hasTodayPresence
                      ? "Les enseignants ont déjà enregistré la présence pour aujourd'hui."
                      : "Aucune présence enregistrée pour aujourd'hui. Merci de vérifier que les enseignants ont fait l'appel."}
                  </p>
                </div>
                <div
                  className={
                    "flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold " +
                    (hasTodayPresence
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-400 text-white")
                  }
                >
                  {hasTodayPresence ? "OK" : "!"}
                </div>
              </div>
            </Card>
          </div>

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

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Presence chart */}
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold mb-4">{t("presenceChartTitle")}</h2>
              {presenceStats && presenceStats.length > 0 && maxPresenceTotal > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {presenceStats.map((d: any) => {
                    const total = (d.present || 0) + (d.absent || 0) + (d.justifie || 0);
                    return (
                      <div key={d.date} className="text-xs text-muted-foreground">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">{d.date}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {total}
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {total} {t("presenceChartLabelChildren")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("presenceChartEmpty")}</p>
              )}
            </Card>

            {/* Inscriptions chart */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t("inscriptionChartTitle")}</h2>
              {inscriptionStats && inscriptionStats.length > 0 && maxInscriptionsTotal > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {inscriptionStats.map((m: any) => {
                    const label = m.month;
                    return (
                      <div key={label} className="text-xs text-muted-foreground">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">{label}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                              {m.total}
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {m.total} {t("inscriptionChartLabelApplications")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("inscriptionChartEmpty")}</p>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
