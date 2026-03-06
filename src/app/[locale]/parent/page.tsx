"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"
import { use } from "react"
import { Locale } from "@/lib/i18n/config"
import { apiClient } from "@/lib/api"
import { DailyResume } from "@/types/domain"
import { Home, CheckCircle2, Baby, Utensils, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

type Tab = "home" | "presence" | "child" | "menu" | "events"

export default function ParentDashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params)
  const t = useTranslations("parent")
  const [activeTab, setActiveTab] = useState<Tab>("home")

  const [child, setChild] = useState<{
    id: string | number; classeId?: string | null; name: string; class: string
    birthdate?: string | null; age?: string; avatar: string; photoUrl?: string | null
    status?: string; allergies: string[]
  } | null>(null)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [todayMenu, setTodayMenu] = useState<{ date: string; entree?: string | null; plat?: string | null; dessert?: string | null } | null>(null)
  const [weekMenus, setWeekMenus] = useState<Record<string, { date: string; entree?: string | null; plat?: string | null; dessert?: string | null }>>({})
  const [upcomingEvents, setUpcomingEvents] = useState<{ id: string; date: string; title: string; time?: string | null; description?: string | null }[]>([])
  const [authorizedPersons, setAuthorizedPersons] = useState<{ id: string; name: string; role?: string | null; phone?: string | null }[]>([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [dailyMessage, setDailyMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [childDailyResume, setChildDailyResume] = useState<DailyResume | null>(null)
  const [dailyResumeError, setDailyResumeError] = useState<string | null>(null)
  const [presences, setPresences] = useState<any[]>([])

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const [selectedDate, setSelectedDate] = useState<Date>(todayDate)
  const [dateDataLoading, setDateDataLoading] = useState(false)

  const selectedDateStr = selectedDate.toISOString().split("T")[0]
  const isToday = selectedDate.getTime() === todayDate.getTime()

  const goToPrevDay = () => setSelectedDate(d => { const p = new Date(d); p.setDate(p.getDate() - 1); return p })
  const goToNextDay = () => { if (!isToday) setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n }) }
  const goToToday = () => setSelectedDate(todayDate)

  useEffect(() => {
    let cancelled = false
    async function loadProfileAndResume() {
      try {
        setProfileLoading(true); setProfileError(null)
        const profileRes = await apiClient.getParentProfile()
        const profile = profileRes.data
        const enfant = Array.isArray(profile?.enfants) && profile.enfants.length > 0 ? profile.enfants[0] : null
        if (!enfant) { if (!cancelled) setProfileError("Aucun enfant associé au compte parent.") }
        else if (!cancelled) {
          setChild({ id: enfant.id, classeId: enfant.classeId ?? null, name: `${enfant.prenom ?? ""} ${enfant.nom ?? ""}`.trim() || "Enfant",
            class: enfant.classeNom ?? enfant.classeId ?? "", birthdate: enfant.dateNaissance ?? null, age: undefined,
            avatar: "👧", photoUrl: enfant.photoUrl ?? null, status: undefined,
            allergies: Array.isArray(enfant.allergies) ? enfant.allergies : [] })
          if (enfant.classeId) {
            try {
              const journalRes = await apiClient.getClassJournal(enfant.classeId as string)
              const journal = journalRes.data
              if (!cancelled && journal) {
                const fromObs = typeof journal.observations === "string" ? journal.observations : ""
                const combined = [journal.activites, journal.apprentissages].filter((p: any) => typeof p === "string" && p.trim().length > 0).join(". ")
                setDailyMessage(fromObs || combined || null)
              }
            } catch {}
          }
          if (enfant.classeId) {
            try {
              const today = new Date()
              const day = (today.getDay() + 6) % 7
              const monday = new Date(today); monday.setDate(today.getDate() - day); monday.setHours(0,0,0,0)
              const menusByDate: Record<string, any> = {}
              for (let i = 0; i < 7; i++) {
                const d = new Date(monday); d.setDate(monday.getDate() + i)
                const dateStr = d.toISOString().slice(0, 10)
                try {
                  const res = await apiClient.getClassMenu(enfant.classeId as string, dateStr)
                  const menu = res.data
                  if (menu) menusByDate[dateStr] = { date: menu.date, entree: menu.entree ?? null, plat: menu.plat ?? null, dessert: menu.dessert ?? null }
                } catch {}
              }
              if (!cancelled) {
                setWeekMenus(menusByDate)
                const todayKey = today.toISOString().slice(0, 10)
                const todayTime = new Date(todayKey).getTime()
                if (menusByDate[todayKey]) { setTodayMenu(menusByDate[todayKey]) }
                else {
                  const entries = Object.values(menusByDate)
                  if (entries.length > 0) {
                    const closest = entries.reduce((best: any, cur: any) => Math.abs(new Date(cur.date).getTime() - todayTime) < Math.abs(new Date(best.date).getTime() - todayTime) ? cur : best)
                    setTodayMenu(closest)
                  }
                }
              }
            } catch {}
          }
          const delegations = Array.isArray(enfant.delegations) ? enfant.delegations : []
          if (delegations.length > 0) setAuthorizedPersons(delegations.map((d: any) => ({ id: d.id, name: d.nom, role: d.relation ?? null, phone: d.telephone ?? null })))
          else if (Array.isArray(profile?.tuteurs)) setAuthorizedPersons(profile.tuteurs.map((tt: any) => ({ id: tt.id, name: `${tt.prenom ?? ""} ${tt.nom ?? ""}`.trim() || tt.email || "", role: tt.lien ?? null, phone: tt.telephone ?? null })))
          try {
            const eventsRes = await apiClient.listParentEvents({ page: 1, pageSize: 10 })
            const payload = eventsRes.data
            const rawEvents: any[] = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []
            if (!cancelled) setUpcomingEvents(rawEvents.map((ev: any) => {
              const start = ev.startAt ? new Date(ev.startAt) : null; const end = ev.endAt ? new Date(ev.endAt) : null
              let timeLabel: string | null = null
              if (start) { const st = start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); timeLabel = end ? `${st} – ${end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : st }
              return { id: ev.id ?? String(Math.random()), date: start ? start.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).toUpperCase() : "", title: ev.titre ?? ev.title ?? "", time: timeLabel, description: ev.description ?? null }
            }))
          } catch {}
        }
      } finally { if (!cancelled) setProfileLoading(false) }
    }
    loadProfileAndResume()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!child?.id) return
    let cancelled = false
    async function loadDateData() {
      setDateDataLoading(true); setDailyResumeError(null); setChildDailyResume(null)
      try {
        const resumeRes = await apiClient.getChildResume(child!.id as string, selectedDateStr)
        if (!cancelled) setChildDailyResume(resumeRes.data)
      } catch (err: any) {
        if (!cancelled) { setChildDailyResume(null); const msg = err?.response?.data?.message; setDailyResumeError(typeof msg === "string" ? msg : null) }
      } finally { if (!cancelled) setDateDataLoading(false) }
    }
    void loadDateData()
    return () => { cancelled = true }
  }, [selectedDateStr, child?.id])

  useEffect(() => {
    if (!child?.id) return
    apiClient.getChildPresences(child.id as string, 1, 20).then(res => {
      const items = res.data?.data ?? res.data?.items ?? res.data ?? []
      setPresences(Array.isArray(items) ? items : [])
    }).catch(() => {})
  }, [child?.id])

  const handlePasswordChange = async () => {
    setPasswordMessage(null); setPasswordError(null)
    if (passwords.new !== passwords.confirm) { setPasswordError(t("profile.passwordMismatch")); return }
    try {
      await apiClient.changePassword(passwords.current, passwords.new)
      setPasswords({ current: "", new: "", confirm: "" }); setShowPasswordForm(false); setPasswordMessage(t("profile.passwordChanged"))
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setPasswordError(typeof msg === "string" ? msg : Array.isArray(msg) ? msg.join(" ") : "Erreur lors du changement de mot de passe.")
    }
  }

  if (profileLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center mx-auto animate-pulse"><span className="text-2xl">👶</span></div>
        <p className="text-sm text-gray-500">Chargement…</p>
      </div>
    </div>
  )
  if (profileError) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm text-center p-6"><p className="text-red-600 text-sm">{profileError}</p></Card>
    </div>
  )

  // ─── Nav items ────────────────────────────────────────────────────────────
  const navItems: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "home",     icon: <Home className="w-5 h-5" />,          label: "Accueil" },
    { id: "presence", icon: <CheckCircle2 className="w-5 h-5" />,  label: "Présence" },
    { id: "child",    icon: <Baby className="w-5 h-5" />,          label: "Enfant" },
    { id: "menu",     icon: <Utensils className="w-5 h-5" />,      label: "Menu" },
    { id: "events",   icon: <CalendarDays className="w-5 h-5" />,  label: "Événements" },
  ]

  // ─── Date nav helper ──────────────────────────────────────────────────────
  const DateNav = () => (
    <div className="flex items-center gap-1">
      <button type="button" onClick={goToPrevDay} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="text-center min-w-[110px]">
        <p className="text-xs font-semibold text-sky-700">
          {isToday ? "Aujourd'hui" : selectedDate.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" })}
        </p>
      </div>
      <button type="button" onClick={goToNextDay} disabled={isToday} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight className="w-4 h-4" />
      </button>
      {!isToday && <button type="button" onClick={goToToday} className="ml-1 text-xs text-sky-600 hover:underline">Aujourd'hui</button>}
    </div>
  )

  // ─── Daily Resume Cards ───────────────────────────────────────────────────
  const DailyResumeContent = () => (
    <div>
      {dateDataLoading ? (
        <p className="text-sm text-gray-400 text-center py-6 animate-pulse">Chargement…</p>
      ) : childDailyResume ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">{new Date(childDailyResume.date).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: "🙂", label: "Humeur",        value: childDailyResume.humeur,         color: "text-sky-600" },
              { emoji: "😴", label: "Sieste",         value: childDailyResume.sieste,         color: "text-indigo-600" },
              { emoji: "🍽️", label: "Appétit",        value: childDailyResume.appetit,        color: "text-orange-600" },
              { emoji: "✨", label: "Participation",  value: childDailyResume.participation,  color: "text-emerald-600" },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col gap-1">
                <span className="text-xl">{item.emoji}</span>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={`text-sm font-bold ${item.color}`}>{item.value ?? "—"}</p>
              </div>
            ))}
          </div>
          {childDailyResume.observations && childDailyResume.observations.length > 0 && (
            <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
              <p className="text-xs font-medium text-sky-700 mb-1">💬 Observations</p>
              <ul className="text-sm text-gray-600 space-y-0.5">
                {childDailyResume.observations.map((obs, i) => <li key={i}>• {obs}</li>)}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">{isToday ? "Aucun résumé disponible pour aujourd'hui." : `Aucun résumé pour le ${selectedDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}.`}</p>
          {!isToday && <button type="button" onClick={goToToday} className="mt-2 text-xs text-sky-600 hover:underline">Voir aujourd'hui</button>}
        </div>
      )}
    </div>
  )

  // ─── Tab: Home ────────────────────────────────────────────────────────────
  const HomeTab = () => (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* Child hero card */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-400 rounded-2xl p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/40">
            {child?.photoUrl ? <img src={child.photoUrl} alt={child.name} className="w-full h-full object-cover" /> : <span className="text-3xl">{child?.avatar ?? "👧"}</span>}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{child?.name ?? ""}</h2>
            <p className="text-sky-100 text-sm">{child?.class}</p>
          </div>
        </div>
      </div>

      {/* Daily resume */}
      <Card className="border border-sky-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-3 border-b border-sky-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900">Résumé du jour</CardTitle>
            <DateNav />
          </div>
        </CardHeader>
        <CardContent className="pt-4"><DailyResumeContent /></CardContent>
      </Card>

      {/* Class message */}
      <Card className="border border-sky-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-3 border-b border-sky-50">
          <CardTitle className="text-sm font-bold text-gray-900">💬 Message de la classe</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {dailyMessage ? <p className="text-sm text-gray-700 leading-relaxed">{dailyMessage}</p> : <p className="text-sm text-gray-400">Aucun message pour aujourd'hui.</p>}
        </CardContent>
      </Card>

      {/* Events preview */}
      {upcomingEvents.length > 0 && (
        <Card className="border border-green-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3 border-b border-green-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-900">📅 Événements à venir</CardTitle>
              <button type="button" onClick={() => setActiveTab("events")} className="text-xs text-sky-600 hover:underline">Voir tout</button>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-2">
            {upcomingEvents.slice(0, 2).map(ev => (
              <div key={ev.id} className="flex items-center gap-3 p-2 rounded-xl bg-green-50 border border-green-100">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{ev.date}</div>
                <div><p className="text-sm font-semibold text-gray-900">{ev.title}</p>{ev.time && <p className="text-xs text-gray-500">{ev.time}</p>}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )

  // ─── Tab: Presence ────────────────────────────────────────────────────────
  const PresenceTab = () => {
    const todayStr = new Date().toISOString().split("T")[0]
    const todayPresence = presences.find((p: any) => (p.date ?? "").slice(0, 10) === todayStr)
    const statut = todayPresence?.statut
    return (
      <div className="px-4 pt-4 pb-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Présences</h2>
        {/* Today status */}
        <div className={`rounded-2xl p-4 border-2 ${statut === "Present" ? "bg-emerald-50 border-emerald-300" : statut === "Absent" ? "bg-red-50 border-red-300" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{statut === "Present" ? "✅" : statut === "Absent" ? "❌" : "❓"}</span>
            <div>
              <p className="font-bold text-gray-900">{statut === "Present" ? "Présent(e) aujourd'hui" : statut === "Absent" ? "Absent(e) aujourd'hui" : "Statut du jour inconnu"}</p>
              <p className="text-xs text-gray-500">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}</p>
            </div>
          </div>
        </div>

        {/* Resume du jour */}
        <Card className="border border-sky-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3 border-b border-sky-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-900">Résumé du jour</CardTitle>
              <DateNav />
            </div>
          </CardHeader>
          <CardContent className="pt-4"><DailyResumeContent /></CardContent>
        </Card>

        {/* Attendance history */}
        {presences.length > 0 && (
          <Card className="border border-gray-100 shadow-sm rounded-2xl">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="text-sm font-bold text-gray-900">Historique des présences</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-1.5">
              {presences.slice(0, 15).map((p: any, i: number) => {
                const d = (p.date ?? "").slice(0, 10)
                const label = d ? new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" }) : "—"
                return (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <p className="text-sm text-gray-700 capitalize">{label}</p>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${p.statut === "Present" ? "bg-emerald-100 text-emerald-700" : p.statut === "Absent" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{p.statut ?? "—"}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // ─── Tab: Child ───────────────────────────────────────────────────────────
  const ChildTab = () => (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Profil de l'enfant</h2>

      {/* Child info */}
      <Card className="border border-sky-100 shadow-sm rounded-2xl">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-sky-200 flex items-center justify-center flex-shrink-0 border-2 border-sky-300">
              {child?.photoUrl ? <img src={child.photoUrl} alt={child.name} className="w-full h-full object-cover" /> : <span className="text-3xl">{child?.avatar ?? "👧"}</span>}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-lg">{child?.name ?? ""}</p>
              <p className="text-sm text-sky-600">{child?.class}</p>
              {child?.birthdate && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Né(e) le {new Date(child.birthdate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
          {child?.allergies && child.allergies.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-red-600 uppercase mb-1">⚠️ Allergies</p>
              <p className="text-sm text-gray-700">{child.allergies.join(", ")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authorized persons */}
      {authorizedPersons.length > 0 && (
        <Card className="border border-sky-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3 border-b border-sky-50">
            <CardTitle className="text-sm font-bold text-gray-900">👥 Personnes autorisées</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-2">
            {authorizedPersons.map(person => (
              <div key={person.id} className="rounded-xl bg-sky-50 border border-sky-100 p-3">
                <p className="font-semibold text-sm text-gray-900">{person.name}</p>
                {person.role && <p className="text-xs text-gray-600 mt-0.5">{person.role}</p>}
                {person.phone && <p className="text-xs text-sky-600 mt-0.5">📞 {person.phone}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Password change */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-3 border-b border-gray-50">
          <CardTitle className="text-sm font-bold text-gray-900">🔐 Sécurité</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {passwordMessage && <div className="mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{passwordMessage}</div>}
          {passwordError && <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{passwordError}</div>}
          {!showPasswordForm ? (
            <Button onClick={() => setShowPasswordForm(true)} variant="outline" size="sm" className="w-full border-gray-200">Changer le mot de passe</Button>
          ) : (
            <div className="space-y-3">
              {[
                { key: "current" as const, label: "Mot de passe actuel", ph: "••••••••" },
                { key: "new" as const,     label: "Nouveau mot de passe", ph: "••••••••" },
                { key: "confirm" as const, label: "Confirmer",           ph: "••••••••" },
              ].map(field => (
                <div key={field.key}>
                  <p className="text-xs font-medium text-gray-600 mb-1">{field.label}</p>
                  <Input type="password" placeholder={field.ph} value={passwords[field.key]} onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))} className="h-10" />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Button onClick={handlePasswordChange} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">Enregistrer</Button>
                <Button onClick={() => setShowPasswordForm(false)} variant="outline" size="sm" className="flex-1">Annuler</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // ─── Tab: Menu ────────────────────────────────────────────────────────────
  const MenuTab = () => (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Menu</h2>

      {/* Today's menu */}
      <Card className="border-2 border-sky-300 shadow-md rounded-2xl bg-gradient-to-b from-sky-50 to-white">
        <CardHeader className="pb-3 border-b border-sky-200">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2"><span>🍽️</span> Menu du jour</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {todayMenu ? (
            <div className="space-y-3">
              <p className="text-xs text-sky-600 font-medium">{new Date(todayMenu.date).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}</p>
              {[
                { icon: "🥛", label: "Collation matin",  value: todayMenu.entree },
                { icon: "🍗", label: "Repas",            value: todayMenu.plat },
                { icon: "🍎", label: "Goûter",           value: todayMenu.dessert },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex items-start gap-3 py-2 border-t border-sky-100 first:border-0 first:pt-0">
                  <span className="text-xl flex-shrink-0">{row.icon}</span>
                  <div><p className="text-xs font-medium text-gray-500 uppercase">{row.label}</p><p className="text-sm font-semibold text-gray-900">{row.value}</p></div>
                </div>
              ))}
              {!todayMenu.entree && !todayMenu.plat && !todayMenu.dessert && <p className="text-sm text-gray-400">Aucun repas renseigné.</p>}
            </div>
          ) : <p className="text-sm text-gray-400">Aucun menu publié pour cette semaine.</p>}
        </CardContent>
      </Card>

      {/* Week menus */}
      {Object.keys(weekMenus).length > 0 && (
        <Card className="border border-sky-100 shadow-sm rounded-2xl">
          <CardHeader className="pb-3 border-b border-sky-50">
            <CardTitle className="text-sm font-bold text-gray-900">📋 Menus de la semaine</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            {Object.values(weekMenus).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((menu: any) => (
              <div key={menu.date} className="rounded-xl border border-sky-50 bg-sky-50/50 p-3">
                <p className="text-xs font-bold text-sky-700 mb-2 uppercase">{new Date(menu.date).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "short" })}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[{ icon: "🥛", v: menu.entree }, { icon: "🍗", v: menu.plat }, { icon: "🍎", v: menu.dessert }].map((r, i) => (
                    <div key={i} className="text-center"><span>{r.icon}</span><p className="text-gray-700 mt-0.5 truncate">{r.v || "—"}</p></div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )

  // ─── Tab: Events ──────────────────────────────────────────────────────────
  const EventsTab = () => (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Événements</h2>
      {upcomingEvents.length === 0 ? (
        <Card className="border border-gray-100 rounded-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <span className="text-4xl">📅</span>
            <p className="mt-3 text-sm text-gray-400">Aucun événement à venir.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map(ev => (
            <div key={ev.id} className="flex items-start gap-3 rounded-2xl bg-white border border-green-100 shadow-sm p-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 text-center leading-tight">{ev.date}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{ev.title}</p>
                {ev.time && <p className="text-xs text-gray-500 mt-0.5">🕐 {ev.time}</p>}
                {ev.description && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{ev.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {activeTab === "home"     && <HomeTab />}
      {activeTab === "presence" && <PresenceTab />}
      {activeTab === "child"    && <ChildTab />}
      {activeTab === "menu"     && <MenuTab />}
      {activeTab === "events"   && <EventsTab />}

      {/* ── Fixed Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all ${isActive ? "text-sky-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <span className={`transition-transform duration-150 ${isActive ? "scale-110" : ""}`}>{item.icon}</span>
                <span className={`text-[10px] font-medium ${isActive ? "text-sky-600" : "text-gray-400"}`}>{item.label}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-sky-500 mt-0.5" />}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
