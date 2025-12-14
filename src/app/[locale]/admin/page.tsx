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
  const [teacherAttendanceStatus, setTeacherAttendanceStatus] = useState<any[] | null>(null);
  const [presencePeriod, setPresencePeriod] = useState<'day' | 'week' | 'month'>('week');

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

        // Calculer les dates selon la période sélectionnée
        let presenceFrom: Date;
        let presenceTo: Date = new Date(now);
        presenceTo.setHours(23, 59, 59, 999);
        
        if (presencePeriod === 'day') {
          presenceFrom = new Date(now);
          presenceFrom.setHours(0, 0, 0, 0);
        } else if (presencePeriod === 'week') {
          presenceFrom = new Date(now);
          presenceFrom.setDate(now.getDate() - 7);
          presenceFrom.setHours(0, 0, 0, 0);
        } else {
          presenceFrom = fromMonthly;
          presenceTo = toMonthly;
        }

        const [
          inscriptionsRes,
          childrenRes,
          classesRes,
          eventsRes,
          presencesRes,
          inscriptionStatsRes,
          upcomingEventsRes,
          teacherAttendanceRes,
        ] = await Promise.all([
          apiClient.listAdminInscriptions(),
          apiClient.listChildren(1, 1000),
          apiClient.listClasses(),
          apiClient.listAdminEvents({ page: 1, pageSize: 100 }),
          apiClient.listDashboardPresences({
            from: presenceFrom.toISOString().slice(0, 10),
            to: presenceTo.toISOString().slice(0, 10),
          }),
          apiClient.listDashboardInscriptions({ year: currentYear }),
          apiClient.listDashboardUpcomingEvents({
            from: now.toISOString(),
            to: oneMonthAhead.toISOString(),
          }),
          apiClient.listDashboardTeacherAttendanceStatus(),
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

        const teacherAttendancePayload = teacherAttendanceRes.data;
        const teacherAttendanceItems: any[] = Array.isArray(teacherAttendancePayload?.items)
          ? teacherAttendancePayload.items
          : [];
        setTeacherAttendanceStatus(teacherAttendanceItems);
      } catch (err) {
        console.error("[Admin/Dashboard] Error loading inscriptions stats", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [router, presencePeriod]);

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

  // Statuts enseignants du jour
  const todayTeacherAttendance = teacherAttendanceStatus?.filter((item: any) => item.date === todayStr) || [];
  const totalTeachers = todayTeacherAttendance.length;
  const completedTeachers = todayTeacherAttendance.filter((item: any) => item.completed).length;
  const pendingTeachers = totalTeachers - completedTeachers;

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

          {/* Teacher attendance status */}
          <div className="mb-6">
            <Card className="p-4 border border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Statut des enseignants
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    {completedTeachers}/{totalTeachers} enseignants ont complété l'appel aujourd'hui
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold bg-emerald-500 text-white">
                    {completedTeachers}
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold bg-amber-400 text-white">
                    {pendingTeachers}
                  </div>
                </div>
              </div>
              {todayTeacherAttendance.length > 0 && (
                <div className="mt-4 space-y-2">
                  {todayTeacherAttendance.map((teacher: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">
                        {teacher.enseignantPrenom} {teacher.enseignantNom}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">
                          {teacher.classes?.map((c: any) => c.classeNom).join(', ') || 'Aucune classe'}
                        </span>
                        <div
                          className={
                            "w-4 h-4 rounded-full " +
                            (teacher.completed
                              ? "bg-emerald-500"
                              : "bg-amber-400")
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t("presenceChartTitle")}</h2>
                <div className="flex gap-2">
                  <Button
                    variant={presencePeriod === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPresencePeriod('day')}
                    className="text-xs"
                  >
                    Jour
                  </Button>
                  <Button
                    variant={presencePeriod === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPresencePeriod('week')}
                    className="text-xs"
                  >
                    Semaine
                  </Button>
                  <Button
                    variant={presencePeriod === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPresencePeriod('month')}
                    className="text-xs"
                  >
                    Mois
                  </Button>
                </div>
              </div>
              {presenceStats && presenceStats.length > 0 && maxPresenceTotal > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {presenceStats.map((d: any) => {
                    const total = (d.present || 0) + (d.absent || 0) + (d.justifie || 0);
                    const presentPercent = total > 0 ? Math.round(((d.present || 0) / total) * 100) : 0;
                    const dateObj = new Date(d.date);
                    const formattedDate = dateObj.toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: '2-digit',
                      ...(presencePeriod === 'week' || presencePeriod === 'month' ? { year: '2-digit' } : {})
                    });
                    return (
                      <div key={d.date} className="text-xs text-muted-foreground border-b pb-2 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground">{formattedDate}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-green-600">✓ {d.present || 0}</span>
                            <span className="text-[10px] text-red-600">✗ {d.absent || 0}</span>
                            <span className="text-[10px] text-blue-600">~ {d.justifie || 0}</span>
                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {total}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full" 
                              style={{ width: `${presentPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500">{presentPercent}% présents</span>
                        </div>
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
