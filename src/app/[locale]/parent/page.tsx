"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"
import { use } from "react"
import { Locale } from "@/lib/i18n/config"
import { apiClient } from "@/lib/api"

export default function ParentDashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params)
  const t = useTranslations("parent")
  const [activeTab, setActiveTab] = useState("overview")
  const [child, setChild] = useState<{
    id: string | number
    classeId?: string | null
    name: string
    class: string
    birthdate?: string | null
    age?: string
    avatar: string
    status?: string
    allergies: string[]
  } | null>(null)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [todayMenu, setTodayMenu] = useState<{
    date: string
    entree?: string | null
    plat?: string | null
    dessert?: string | null
  } | null>(null)
  const [weekMenus, setWeekMenus] = useState<
    Record<
      string,
      {
        date: string
        entree?: string | null
        plat?: string | null
        dessert?: string | null
      }
    >
  >({})
  const [upcomingEvents, setUpcomingEvents] = useState<{
    id: string
    date: string
    title: string
    time?: string | null
  }[]>([])

  const [authorizedPersons, setAuthorizedPersons] = useState<
    { id: string; name: string; role?: string | null; phone?: string | null }[]
  >([])

  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [dailyMessage, setDailyMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProfileAndResume() {
      try {
        setProfileLoading(true)
        setProfileError(null)

        const profileRes = await apiClient.getParentProfile()
        const profile = profileRes.data

        // Debug: afficher les infos du parent connecté, ses tuteurs et ses enfants
        console.log("[ParentDashboard] Profil parent connecté:", {
          email: profile?.email,
          tuteurId: profile?.tuteurId,
          familleId: profile?.familleId,
        })
        console.log("[ParentDashboard] Tuteurs (personnes autorisées):", profile?.tuteurs)
        console.log("[ParentDashboard] Enfants:", profile?.enfants)

        const enfant = Array.isArray(profile?.enfants) && profile.enfants.length > 0
          ? profile.enfants[0]
          : null
        if (!enfant) {
          if (!cancelled) {
            setProfileError("Aucun enfant associé au compte parent.")
          }
        } else if (!cancelled) {
          setChild({
            id: enfant.id,
            classeId: enfant.classeId ?? null,
            name: `${enfant.prenom ?? ""} ${enfant.nom ?? ""}`.trim() || "Enfant",
            class: enfant.classeNom ?? enfant.classeId ?? "",
            birthdate: enfant.dateNaissance ?? null,
            // TODO: calculer un âge lisible si besoin
            age: undefined,
            avatar: "👧",
            status: undefined,
            allergies: Array.isArray(enfant.allergies) ? enfant.allergies : [],
          })

          // Charger le message de la journée collectif de la classe (ClassDailySummary publié le plus récent)
          if (enfant.classeId) {
            try {
              const journalRes = await apiClient.getClassJournal(enfant.classeId as string)
              const journal = journalRes.data

              if (!cancelled && journal) {
                // On privilégie le champ observations si présent, sinon on concatène activités/apprentissages
                const fromObservations = typeof journal.observations === "string" ? journal.observations : ""
                const combined = [journal.activites, journal.apprentissages]
                  .filter((p: any) => typeof p === "string" && p.trim().length > 0)
                  .join(". ")

                const message = fromObservations || combined || null
                setDailyMessage(message)
              }
            } catch (err) {
              console.error("[Parent] Error loading class daily message", err)
            }
          }

          // Charger le menu du jour + menus de la semaine pour la classe de l'enfant
          if (enfant.classeId) {
            try {
              const today = new Date()
              const day = (today.getDay() + 6) % 7 // 0 = lundi
              const monday = new Date(today)
              monday.setDate(today.getDate() - day)
              monday.setHours(0, 0, 0, 0)

              const menusByDate: Record<string, { date: string; entree?: string | null; plat?: string | null; dessert?: string | null }> = {}

              for (let i = 0; i < 7; i++) {
                const d = new Date(monday)
                d.setDate(monday.getDate() + i)
                const dateStr = d.toISOString().slice(0, 10)
                try {
                  const res = await apiClient.getClassMenu(enfant.classeId as string, dateStr)
                  const menu = res.data
                  if (menu) {
                    menusByDate[dateStr] = {
                      date: menu.date,
                      entree: menu.entree ?? null,
                      plat: menu.plat ?? null,
                      dessert: menu.dessert ?? null,
                    }
                  }
                } catch (err) {
                  // Pas de menu pour ce jour, on ignore
                }
              }

              if (!cancelled) {
                setWeekMenus(menusByDate)

                const todayKey = today.toISOString().slice(0, 10)
                const todayTime = new Date(todayKey).getTime()

                // 1) Si un menu existe exactement pour aujourd'hui, on l'affiche
                if (menusByDate[todayKey]) {
                  setTodayMenu(menusByDate[todayKey])
                } else {
                  // 2) Sinon, on cherche le menu dont la date est la plus proche d'aujourd'hui
                  const entries = Object.values(menusByDate)
                  if (entries.length > 0) {
                    const closest = entries.reduce((best, current) => {
                      const currentTime = new Date(current.date).getTime()
                      const bestTime = new Date(best.date).getTime()
                      const currentDiff = Math.abs(currentTime - todayTime)
                      const bestDiff = Math.abs(bestTime - todayTime)
                      return currentDiff < bestDiff ? current : best
                    })

                    setTodayMenu(closest)
                  }
                }
              }
            } catch (err) {
              console.error("[Parent] Error loading class menus week", err)
            }
          }

          // Charger les personnes autorisées (tuteurs de la famille)
          if (Array.isArray(profile?.tuteurs)) {
            setAuthorizedPersons(
              profile.tuteurs.map((t: any) => ({
                id: t.id,
                name: `${t.prenom ?? ""} ${t.nom ?? ""}`.trim() || t.email || "",
                role: t.lien ?? null,
                phone: t.telephone ?? null,
              })),
            )
          }

          // Charger les événements liés aux classes de l'enfant
          try {
            const eventsRes = await apiClient.listParentEvents({
              page: 1,
              pageSize: 10,
            })

            const payload = eventsRes.data
            const rawEvents: any[] = Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.items)
              ? payload.items
              : Array.isArray(payload)
              ? payload
              : []

            if (!cancelled) {
              setUpcomingEvents(
                rawEvents.map((ev: any) => {
                  const start = ev.startAt ? new Date(ev.startAt) : null
                  const end = ev.endAt ? new Date(ev.endAt) : null

                  let timeLabel: string | null = null
                  if (start) {
                    const startTime = start.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    if (end) {
                      const endTime = end.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      timeLabel = `${startTime} – ${endTime}`
                    } else {
                      timeLabel = startTime
                    }
                  }

                  const dateLabel = start
                    ? start
                        .toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                        })
                        .toUpperCase()
                    : ""

                  return {
                    id: ev.id ?? String(Math.random()),
                    date: dateLabel,
                    title: ev.titre ?? ev.title ?? "",
                    time: timeLabel,
                  }
                }),
              )
            }
          } catch (err) {
            console.error("[Parent] Error loading events", err)
          }
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false)
        }
      }
    }

    loadProfileAndResume()

    return () => {
      cancelled = true
    }
  }, [])

  const handlePasswordChange = async () => {
    setPasswordMessage(null)
    setPasswordError(null)

    if (passwords.new !== passwords.confirm) {
      setPasswordError(t("profile.passwordMismatch"))
      return
    }

    try {
      await apiClient.changePassword(passwords.current, passwords.new)
      setPasswords({ current: "", new: "", confirm: "" })
      setShowPasswordForm(false)
      setPasswordMessage(t("profile.passwordChanged"))
    } catch (err: any) {
      console.error("[Parent] Error changing password", err)
      const apiMessage = err?.response?.data?.message
      if (typeof apiMessage === "string") {
        setPasswordError(apiMessage)
      } else if (Array.isArray(apiMessage)) {
        setPasswordError(apiMessage.join(" "))
      } else {
        setPasswordError("Une erreur est survenue lors du changement de mot de passe.")
      }
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-3 md:px-4 lg:px-0 pb-10">
      {/* Child Header Card */}
      <Card className="border-0 bg-gradient-to-r from-sky-100 to-sky-50 shadow-md rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-200 text-4xl shadow-sm">
                {child?.avatar ?? "👧"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{child?.name ?? ""}</h2>
                <p className="text-sm text-gray-600">
                  {child?.class}
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-sm font-semibold text-white">
                    <span>✓</span> {child?.status ?? ""}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Classe</p>
              <p className="text-lg font-bold text-gray-900">{child?.class}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Barre d’onglets */}
        <div className="mt-4 flex justify-center">
          <TabsList
            className="
              inline-flex items-center gap-1 
              bg-sky-50 border border-sky-100 
              rounded-full px-2 py-1 shadow-sm
            "
          >
            <TabsTrigger
              value="overview"
              className="
                inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold
                rounded-full
                text-sky-700/70
                data-[state=active]:bg-white data-[state=active]:text-sky-700
                hover:bg-white/70 hover:text-sky-700
              "
            >
              <span>👁️</span>
              <span>{t('tabs.overview')}</span>
            </TabsTrigger>

            <TabsTrigger
              value="menu"
              className="
                inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold
                rounded-full
                text-sky-700/70
                data-[state=active]:bg-white data-[state=active]:text-sky-700
                hover:bg-white/70 hover:text-sky-700
              "
            >
              <span>🍽️</span>
              <span>{t('tabs.menu')}</span>
            </TabsTrigger>

            <TabsTrigger
              value="profile"
              className="
                inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold
                rounded-full
                text-sky-700/70
                data-[state=active]:bg-white data-[state=active]:text-sky-700
                hover:bg-white/70 hover:text-sky-700
              "
            >
              <span>👤</span>
              <span>{t('tabs.profile')}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Vue d'ensemble Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Daily Summary */}
          <Card className="border border-sky-100 shadow-sm rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
            <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
              <CardTitle className="text-base font-bold text-gray-900">{t('overview.dailySummaryTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {profileLoading ? (
                <p className="text-sm text-gray-500">Chargement du résumé de la journée…</p>
              ) : dailyMessage ? (
                <p className="text-sm leading-relaxed text-gray-600">{dailyMessage}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun message de la journée n'a encore été partagé pour aujourd'hui.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border border-sky-100 shadow-sm rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
            <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
              <CardTitle className="text-base font-bold text-gray-900">{t('overview.upcomingEventsTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucun événement à venir n'est planifié pour le moment. Vous serez informé ici des prochaines
                  réunions, fêtes ou sorties.
                </p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 rounded-lg bg-green-50 p-4 border border-green-100"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-500 font-bold text-white text-sm flex-shrink-0">
                      {event.date}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.time}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu du jour + semaine Tab */}
        <TabsContent value="menu" className="space-y-6">
          {/* Menu du jour (ou le plus proche) */}
          <Card className="border-2 border-sky-300 shadow-md rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
            <CardHeader className="border-b border-sky-300 bg-gradient-to-r from-sky-100 to-sky-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span>🍽️</span> {t('menu.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {todayMenu ? (
                <>
                  <p className="text-sm font-semibold text-sky-700 mb-4">
                    {new Date(todayMenu.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="space-y-4">
                    {todayMenu.entree && (
                      <div className="flex gap-3">
                        <span className="text-xl flex-shrink-0">🥛</span>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Petit-déjeuner</p>
                          <p className="text-sm font-semibold text-gray-900">{todayMenu.entree}</p>
                        </div>
                      </div>
                    )}
                    {todayMenu.plat && (
                      <div className="flex gap-3 border-t pt-4">
                        <span className="text-xl flex-shrink-0">🍗</span>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Déjeuner</p>
                          <p className="text-sm font-semibold text-gray-900">{todayMenu.plat}</p>
                        </div>
                      </div>
                    )}
                    {todayMenu.dessert && (
                      <div className="flex gap-3 border-t pt-4">
                        <span className="text-xl flex-shrink-0">🍎</span>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Goûter</p>
                          <p className="text-sm font-semibold text-gray-900">{todayMenu.dessert}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun menu publié pour cette semaine n'est disponible pour la classe de votre enfant.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Menus de la semaine (liste complète) */}
          {Object.keys(weekMenus).length > 0 && (
            <Card className="border border-sky-200 shadow-sm rounded-2xl">
              <CardHeader className="border-b border-sky-100 bg-sky-50 pb-4">
                <CardTitle className="text-base font-bold text-gray-900">
                  Menus de la semaine
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {Object.values(weekMenus)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((menu) => (
                    <div
                      key={menu.date}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border border-sky-100 bg-white px-3 py-2"
                    >
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                          {new Date(menu.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs md:text-sm text-gray-700">
                        {menu.entree && (
                          <span>
                            <span className="font-semibold">Petit-déjeuner :</span> {menu.entree}
                          </span>
                        )}
                        {menu.plat && (
                          <span>
                            <span className="font-semibold">Déjeuner :</span> {menu.plat}
                          </span>
                        )}
                        {menu.dessert && (
                          <span>
                            <span className="font-semibold">Goûter :</span> {menu.dessert}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Profil Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Child Information */}
            <Card className="border border-sky-100 shadow-sm rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
              <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <span>ℹ️</span> {t('profile.childInfoTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-200 text-3xl shadow-sm">
                    {child?.avatar ?? "👧"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{child?.name ?? ""}</p>
                    <p className="text-sm text-gray-600">
                      {child?.class}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase">{t('profile.birthdateLabel')}</p>
                  <p className="font-semibold text-gray-900">
                    {child?.birthdate
                      ? new Date(child.birthdate).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
                {child?.allergies && child.allergies.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase">{t('profile.allergiesLabel')}</p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {child.allergies.map((allergy) => (
                        <span
                          key={allergy}
                          className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Authorized Persons */}
            <Card className="border border-sky-100 shadow-sm rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
              <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <span>👥</span> {t('profile.authorizedPersonsTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {authorizedPersons.map((person) => (
                  <div key={person.id} className="rounded-lg bg-sky-50 p-3 border border-sky-100">
                    <p className="font-semibold text-gray-900">{person.name}</p>
                    {person.role && (
                      <p className="text-xs text-gray-600">{person.role}</p>
                    )}
                    {person.phone && (
                      <p className="text-sm font-semibold text-gray-700 mt-1">{person.phone}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="border border-sky-100 shadow-sm rounded-2xl transform duration-200 hover:-translate-y-0.5">
              <CardHeader className="border-b border-sky-100 bg-sky-100">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <span>🔐</span> {t('profile.securityTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {passwordMessage && (
                  <p className="mb-3 text-xs text-green bg-green-300 boder-green-300 rounded-md px-3 py-2">
                    {passwordMessage}
                  </p>
                )}
                {passwordError && (
                  <p className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {passwordError}
                  </p>
                )}
              
                {!showPasswordForm ? (
                  <Button
                    onClick={() => setShowPasswordForm(true)}
                    className="  bg-gray-100 hover:text-black  transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    {t('profile.changePasswordCta')}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase">Mot de passe actuel</label>
                      <Input
                        type="password"
                        placeholder="Entrez votre mot de passe actuel"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase">Nouveau mot de passe</label>
                      <Input
                        type="password"
                        placeholder="Entrez un nouveau mot de passe"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase">Confirmer le mot de passe</label>
                      <Input
                        type="password"
                        placeholder="Confirmez le nouveau mot de passe"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handlePasswordChange} className="bg-green-600 hover:bg-green-700 text-white">
                        Enregistrer
                      </Button>
                      <Button onClick={() => setShowPasswordForm(false)} variant="outline" className="border-gray-300">
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
       
      </Tabs>
    </div>
  )
}
