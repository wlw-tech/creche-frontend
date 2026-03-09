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
import { Home, CheckCircle2, Baby, Utensils, CalendarDays, ChevronLeft, ChevronRight, Pencil, Check, X } from "lucide-react"

type Tab = "home" | "presence" | "child" | "menu" | "events"

export default function ParentDashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params)
  const t = useTranslations("parent")
  const [activeTab, setActiveTab] = useState<Tab>("home")

  const [child, setChild] = useState<{
    id: string | number; classeId?: string | null; name: string; class: string
    birthdate?: string | null; age?: string; avatar: string; photoUrl?: string | null
    status?: string; allergies: string[]
    classeEnseignants?: { prenom?: string | null; nom?: string | null }[]
    classeNbEleves?: number | null
  } | null>(null)

  const [parentPrenom, setParentPrenom] = useState("")
  const [tuteurs, setTuteurs] = useState<{
    id: string; prenom?: string | null; nom?: string | null; telephone?: string | null
    adresse?: string | null; email?: string | null; lien?: string | null
  }[]>([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [editTelephone, setEditTelephone] = useState("")
  const [editAdresse, setEditAdresse] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaveMsg, setProfileSaveMsg] = useState<string | null>(null)
  const [profileSaveErr, setProfileSaveErr] = useState<string | null>(null)

  // Health state
  const [sante, setSante] = useState<Record<string, unknown> | null>(null)
  const [santeLoading, setSanteLoading] = useState(false)
  const [editingSante, setEditingSante] = useState(false)
  const [santeForm, setSanteForm] = useState<{
    medecin: string; notes: string; restrictionAlimentaire: string; tags: string[]
    allergies: { nom: string; severite?: string }[]; intolerances: { nom: string }[]
  }>({ medecin: "", notes: "", restrictionAlimentaire: "", tags: [], allergies: [], intolerances: [] })
  const [santeSaving, setSanteSaving] = useState(false)
  const [santeSaveMsg, setSanteSaveMsg] = useState<string | null>(null)
  const [santeDeleting, setSanteDeleting] = useState(false)
  // Delegation edit state
  const [editingDelegation, setEditingDelegation] = useState<string | null>(null)
  const [delegationForm, setDelegationForm] = useState<{ nom: string; telephone: string; cin: string; relation: string }>({ nom: "", telephone: "", cin: "", relation: "" })
  const [addingDelegation, setAddingDelegation] = useState(false)
  const [newDelegationForm, setNewDelegationForm] = useState<{ nom: string; telephone: string; cin: string; relation: string }>({ nom: "", telephone: "", cin: "", relation: "" })
  const [delegationSaving, setDelegationSaving] = useState(false)
  const [delegationMsg, setDelegationMsg] = useState<string | null>(null)

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
          const prenom = profile?.prenom ?? profile?.tuteurs?.[0]?.prenom ?? ""
          if (!cancelled) setParentPrenom(prenom)
          const tts = Array.isArray(profile?.tuteurs) ? profile.tuteurs : []
          if (!cancelled) setTuteurs(tts)
          if (!cancelled) setEditTelephone(profile?.telephone ?? tts[0]?.telephone ?? "")
          if (!cancelled) setEditAdresse(profile?.adresse ?? tts[0]?.adresse ?? "")
          setChild({ id: enfant.id, classeId: enfant.classeId ?? null, name: `${enfant.prenom ?? ""} ${enfant.nom ?? ""}`.trim() || "Enfant",
            class: enfant.classeNom ?? enfant.classeId ?? "", birthdate: enfant.dateNaissance ?? null, age: undefined,
            avatar: "👧", photoUrl: enfant.photoUrl ?? null, status: undefined,
            allergies: Array.isArray(enfant.allergies) ? enfant.allergies : [],
            classeEnseignants: Array.isArray(enfant.classeEnseignants) ? enfant.classeEnseignants : [],
            classeNbEleves: enfant.classeNbEleves ?? null })
          // Pre-populate health from profile response (available before backend deploy)
          if (enfant.profilSante) {
            setSante(enfant.profilSante)
            setSanteForm({
              medecin: enfant.profilSante.medecin ?? "",
              notes: enfant.profilSante.notes ?? "",
              restrictionAlimentaire: enfant.profilSante.restrictionAlimentaire ?? "",
              tags: Array.isArray(enfant.profilSante.tags) ? enfant.profilSante.tags : [],
              allergies: Array.isArray(enfant.profilSante.allergies) ? enfant.profilSante.allergies.map((a: {nom:string;severite?:string}) => ({ nom: a.nom, severite: a.severite ?? "" })) : [],
              intolerances: Array.isArray(enfant.profilSante.intolerances) ? enfant.profilSante.intolerances.map((i: {nom:string}) => ({ nom: i.nom })) : [],
            })
          }
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

  // Load health when switching to child tab (runs once per enfant, not on every render)
  useEffect(() => {
    if (activeTab !== "child" || !child?.id) return
    let cancelled = false
    async function fetchSante() {
      setSanteLoading(true)
      try {
        const res = await apiClient.getChildSante(child!.id as string)
        if (!cancelled && res.data) {
          const s = res.data
          setSante(s)
          setSanteForm({
            medecin: (s.medecin as string) ?? "",
            notes: (s.notes as string) ?? "",
            restrictionAlimentaire: (s.restrictionAlimentaire as string) ?? "",
            tags: Array.isArray(s.tags) ? (s.tags as string[]) : [],
            allergies: Array.isArray(s.allergies) ? (s.allergies as {nom:string;severite?:string}[]).map(a => ({ nom: a.nom, severite: a.severite ?? "" })) : [],
            intolerances: Array.isArray(s.intolerances) ? (s.intolerances as {nom:string}[]).map(i => ({ nom: i.nom })) : [],
          })
        }
      } catch { /* 404 = no health profile yet, keep pre-populated data from profile response */ }
      finally { if (!cancelled) setSanteLoading(false) }
    }
    fetchSante()
    return () => { cancelled = true }
  }, [activeTab, child?.id])

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

  const handleSaveProfile = async () => {
    setProfileSaveMsg(null); setProfileSaveErr(null); setProfileSaving(true)
    try {
      await apiClient.updateParentMe({ telephone: editTelephone || undefined, adresse: editAdresse || undefined })
      setTuteurs(prev => prev.map((tt, i) => i === 0 ? { ...tt, telephone: editTelephone||null, adresse: editAdresse||null } : tt))
      setProfileSaveMsg("Profil mis à jour avec succès."); setEditingProfile(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setProfileSaveErr(typeof msg === "string" ? msg : "Erreur lors de la mise à jour.")
    } finally { setProfileSaving(false) }
  }

  if (profileLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto animate-pulse" style={{ background: "#AEDFF7" }}><span className="text-2xl">👶</span></div>
        <p className="text-sm text-gray-500">Chargement…</p>
      </div>
    </div>
  )
  if (profileError) return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
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
        <p className="text-xs font-semibold" style={{ color: "#1A1A1A" }}>
          {isToday ? "Aujourd'hui" : selectedDate.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" })}
        </p>
      </div>
      <button type="button" onClick={goToNextDay} disabled={isToday} className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight className="w-4 h-4" />
      </button>
      {!isToday && <button type="button" onClick={goToToday} className="ml-1 text-xs hover:underline" style={{ color: "#FF6F61" }}>Aujourd'hui</button>}
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
              { emoji: "🙂", label: "Humeur",        value: childDailyResume.humeur,         color: "#EBF7FD", textColor: "#1A73A7" },
              { emoji: "😴", label: "Sieste",         value: childDailyResume.sieste,         color: "#F0EEFF", textColor: "#5B4FCF" },
              { emoji: "🍽️", label: "Appétit",        value: childDailyResume.appetit,        color: "#FFF4ED", textColor: "#D97706" },
              { emoji: "✨", label: "Participation",  value: childDailyResume.participation,  color: "#F0FDF4", textColor: "#16A34A" },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-3 flex flex-col gap-1" style={{ background: item.color, border: "1px solid rgba(0,0,0,0.06)" }}>
                <span className="text-xl">{item.emoji}</span>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-bold" style={{ color: item.textColor }}>{item.value ?? "—"}</p>
              </div>
            ))}
          </div>
          {childDailyResume.observations && childDailyResume.observations.length > 0 && (
            <div className="rounded-xl p-3 border" style={{ background: "rgba(174,223,247,0.2)", borderColor: "#AEDFF7" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "#1A1A1A" }}>💬 Observations</p>
              <ul className="text-sm text-gray-600 space-y-0.5">
                {childDailyResume.observations.map((obs, i) => <li key={i}>• {obs}</li>)}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">{isToday ? "Aucun résumé disponible pour aujourd'hui." : `Aucun résumé pour le ${selectedDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}.`}</p>
          {!isToday && <button type="button" onClick={goToToday} className="mt-2 text-xs hover:underline" style={{ color: "#FF6F61" }}>Voir aujourd'hui</button>}
        </div>
      )}
    </div>
  )

  // ─── Tab: Home ────────────────────────────────────────────────────────────
  const HomeTab = () => (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* Greeting + child hero */}
      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="rounded-2xl p-5" style={{ background: "#EBF6FB", border: "1.5px solid transparent", animation: "fadeSlideIn 0.5s ease-out" }}>
        <p className="text-xs font-medium mb-1" style={{ color: "#1A1A1A", opacity: 0.65 }}>
          {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"2-digit",month:"long"})}
        </p>
        <h2 className="text-xl font-bold mb-3" style={{ color: "#1A1A1A" }}>
          {"Bonjour"+(parentPrenom?", "+parentPrenom:"")+" 👋"}
        </h2>
        <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.45)" }}>
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-white/60" style={{ background: "white" }}>
            {child?.photoUrl ? <img src={child.photoUrl} alt={child.name} className="w-full h-full object-cover" /> : <span className="text-2xl">{child?.avatar ?? "👧"}</span>}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base truncate" style={{ color: "#1A1A1A" }}>{child?.name ?? ""}</p>
            <p className="text-sm truncate" style={{ color: "#1A1A1A", opacity: 0.65 }}>{child?.class}</p>
          </div>
        </div>
      </div>

      {/* Daily resume */}
      <Card className="border shadow-sm rounded-2xl" style={{ borderColor: "#AEDFF7" }}>
        <CardHeader className="pb-3 border-b" style={{ borderColor: "#AEDFF7" }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900">Résumé du jour</CardTitle>
            <DateNav />
          </div>
        </CardHeader>
        <CardContent className="pt-4"><DailyResumeContent /></CardContent>
      </Card>

      {/* Class message */}
      <Card className="border shadow-sm rounded-2xl" style={{ borderColor: "#AEDFF7" }}>
        <CardHeader className="pb-3 border-b" style={{ borderColor: "#AEDFF7" }}>
          <CardTitle className="text-sm font-bold text-gray-900">💬 Message de la classe</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {dailyMessage ? <p className="text-sm text-gray-700 leading-relaxed">{dailyMessage}</p> : <p className="text-sm text-gray-400">Aucun message pour aujourd'hui.</p>}
        </CardContent>
      </Card>

      {/* Events preview */}
      {upcomingEvents.length > 0 && (
        <Card className="border shadow-sm rounded-2xl" style={{ borderColor: "#AEDFF7" }}>
          <CardHeader className="pb-3 border-b" style={{ borderColor: "#AEDFF7" }}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-gray-900">📅 Événements à venir</CardTitle>
              <button type="button" onClick={() => setActiveTab("events")} className="text-xs hover:underline" style={{ color: "#FF6F61" }}>Voir tout</button>
            </div>
          </CardHeader>
          <CardContent className="pt-3 space-y-2">
            {upcomingEvents.slice(0, 2).map(ev => (
              <div key={ev.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: "rgba(174,223,247,0.2)", border: "1px solid #C5E8F7" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "#AEDFF7", color: "#1A1A1A" }}>{ev.date}</div>
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
        <Card className="border shadow-sm rounded-2xl" style={{ borderColor: "#AEDFF7" }}>
          <CardHeader className="pb-3 border-b" style={{ borderColor: "#AEDFF7" }}>
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

  const loadSante = async () => {
    if (!child?.id) return
    setSanteLoading(true)
    try {
      const res = await apiClient.getChildSante(child.id as string)
      const s = res.data ?? null
      setSante(s)
      if (s) {
        setSanteForm({
          medecin: (s.medecin as string) ?? "",
          notes: (s.notes as string) ?? "",
          restrictionAlimentaire: (s.restrictionAlimentaire as string) ?? "",
          tags: Array.isArray(s.tags) ? (s.tags as string[]) : [],
          allergies: Array.isArray(s.allergies) ? (s.allergies as {nom:string;severite?:string}[]).map(a => ({ nom: a.nom, severite: a.severite ?? "" })) : [],
          intolerances: Array.isArray(s.intolerances) ? (s.intolerances as {nom:string}[]).map(i => ({ nom: i.nom })) : [],
        })
      } else {
        setSanteForm({ medecin: "", notes: "", restrictionAlimentaire: "", tags: [], allergies: [], intolerances: [] })
      }
    } catch { setSante(null) }
    finally { setSanteLoading(false) }
  }

  const handleSaveSante = async () => {
    if (!child?.id) return
    setSanteSaving(true); setSanteSaveMsg(null)
    try {
      await apiClient.upsertChildSante(child.id as string, santeForm)
      setSanteSaveMsg("Profil santé enregistré.")
      await loadSante()
      setEditingSante(false)
    } catch (err: unknown) {
      const msg = (err as {response?: {data?: {message?: unknown}}})?.response?.data?.message
      setSanteSaveMsg(typeof msg === "string" ? "Erreur: "+msg : "Erreur lors de la sauvegarde.")
    } finally { setSanteSaving(false) }
  }

  const handleDeleteSante = async () => {
    if (!child?.id || !window.confirm("Supprimer le profil santé ?")) return
    setSanteDeleting(true)
    try {
      await apiClient.deleteChildSante(child.id as string)
      setSante(null); setSanteForm({ medecin: "", notes: "", restrictionAlimentaire: "", tags: [], allergies: [], intolerances: [] })
      setSanteSaveMsg("Profil santé supprimé.")
    } catch { setSanteSaveMsg("Erreur lors de la suppression.") }
    finally { setSanteDeleting(false) }
  }

  const handleStartEditDelegation = (d: {id:string; name:string; phone?:string|null; role?:string|null}) => {
    setEditingDelegation(d.id)
    setDelegationForm({ nom: d.name ?? "", telephone: d.phone ?? "", cin: "", relation: d.role ?? "" })
    setDelegationMsg(null)
  }

  const handleSaveDelegation = async (delegationId: string) => {
    if (!child?.id) return
    setDelegationSaving(true); setDelegationMsg(null)
    try {
      await apiClient.updateParentDelegation(child.id as string, delegationId, delegationForm)
      setAuthorizedPersons(prev => prev.map(p => p.id === delegationId ? { ...p, name: delegationForm.nom, phone: delegationForm.telephone, role: delegationForm.relation } : p))
      setEditingDelegation(null); setDelegationMsg("Personne modifiée.")
    } catch { setDelegationMsg("Erreur lors de la modification.") }
    finally { setDelegationSaving(false) }
  }

  const handleDeleteDelegation = async (delegationId: string) => {
    if (!child?.id || !window.confirm("Supprimer cette personne autorisée ?")) return
    setDelegationSaving(true)
    try {
      await apiClient.deleteParentDelegation(child.id as string, delegationId)
      setAuthorizedPersons(prev => prev.filter(p => p.id !== delegationId)); setDelegationMsg("Personne supprimée.")
    } catch { setDelegationMsg("Erreur lors de la suppression.") }
    finally { setDelegationSaving(false) }
  }

  const handleAddDelegation = async () => {
    if (!child?.id) return
    setDelegationSaving(true); setDelegationMsg(null)
    try {
      const res = await apiClient.addParentDelegation(child.id as string, newDelegationForm)
      const d = res.data as {id:string; nom:string; telephone:string; relation:string}
      setAuthorizedPersons(prev => [...prev, { id: d.id, name: d.nom, phone: d.telephone, role: d.relation }])
      setAddingDelegation(false); setNewDelegationForm({ nom: "", telephone: "", cin: "", relation: "" }); setDelegationMsg("Personne ajoutée.")
    } catch { setDelegationMsg("Erreur lors de l'ajout.") }
    finally { setDelegationSaving(false) }
  }

  const ChildTab = () => (
    <div className="px-4 pt-4 pb-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Profil de l'enfant</h2>

      {/* Child + class info */}
      <Card className="border shadow-sm rounded-2xl" style={{ borderColor: "#AEDFF7" }}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border-2" style={{ background: "#AEDFF7", borderColor: "#AEDFF7" }}>
              {child?.photoUrl ? <img src={child.photoUrl} alt={child.name} className="w-full h-full object-cover" /> : <span className="text-3xl">{child?.avatar ?? "👧"}</span>}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-lg">{child?.name ?? ""}</p>
              <p className="text-sm" style={{ color: "#1A1A1A", opacity: 0.6 }}>{child?.class}</p>
              {child?.birthdate && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {"Né(e) le "}{new Date(child.birthdate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
          {(child?.classeNbEleves != null || (child?.classeEnseignants && child.classeEnseignants.length > 0)) && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
              {child?.classeNbEleves != null && (
                <p className="text-sm text-gray-700">👶 <strong>{child.classeNbEleves}</strong> élève{child.classeNbEleves > 1 ? "s" : ""} dans la classe</p>
              )}
              {child?.classeEnseignants && child.classeEnseignants.length > 0 && (
                <p className="text-sm text-gray-700">👩‍🏫 {child.classeEnseignants.map((e, i) => <span key={i}>{i > 0 ? ", " : ""}{[e.prenom, e.nom].filter(Boolean).join(" ") || "Enseignant"}</span>)}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authorized persons with edit/delete/add */}
      <Card className="border shadow-sm rounded-2xl" style={{ borderColor: "#AEDFF7" }}>
        <CardHeader className="pb-3 border-b" style={{ borderColor: "#AEDFF7" }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900">👥 Personnes autorisées</CardTitle>
            <button type="button" onClick={() => { setAddingDelegation(true); setDelegationMsg(null) }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "#EAF5FB", color: "#1A1A1A", border: "1px solid #C5E8F7" }}>
              + Ajouter
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-3 space-y-2">
          {delegationMsg && <p className="text-xs px-3 py-2 rounded-lg mb-1" style={{ background: "#EAF5FB", color: "#1A1A1A" }}>{delegationMsg}</p>}
          {authorizedPersons.length === 0 && !addingDelegation && (
            <p className="text-sm text-gray-400 text-center py-4">Aucune personne autorisée.</p>
          )}
          {authorizedPersons.map(person => (
            <div key={person.id} className="rounded-xl p-3" style={{ background: "rgba(174,223,247,0.15)", border: "1px solid #AEDFF7" }}>
              {editingDelegation === person.id ? (
                <div className="space-y-2">
                  {([["Nom", "nom", "Nom complet"], ["Téléphone", "telephone", "06 00 00 00 00"], ["CIN", "cin", "CIN"], ["Relation", "relation", "Ex: Grand-mère"]] as [string, keyof typeof delegationForm, string][]).map(([label, field, ph]) => (
                    <div key={field}>
                      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                      <Input value={delegationForm[field]} onChange={e => setDelegationForm(prev => ({ ...prev, [field]: e.target.value }))} placeholder={ph} className="h-8 text-sm" />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => handleSaveDelegation(person.id)} disabled={delegationSaving} className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: "#FF6F61" }}>{delegationSaving ? "..." : "Sauvegarder"}</button>
                    <button type="button" onClick={() => setEditingDelegation(null)} className="flex-1 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#EAF5FB", color: "#6B7280", border: "1px solid #C5E8F7" }}>Annuler</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{person.name}</p>
                    {person.role && <p className="text-xs text-gray-600 mt-0.5">{person.role}</p>}
                    {person.phone && <p className="text-xs mt-0.5" style={{ color: "#FF6F61" }}>📞 {person.phone}</p>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button type="button" onClick={() => handleStartEditDelegation(person)} className="p-1.5 rounded-lg" style={{ background: "#EAF5FB", border: "1px solid #C5E8F7" }}><Pencil className="w-3 h-3 text-gray-600" /></button>
                    <button type="button" onClick={() => handleDeleteDelegation(person.id)} disabled={delegationSaving} className="p-1.5 rounded-lg" style={{ background: "#FFF0EE", border: "1px solid #FFD4CE" }}><X className="w-3 h-3 text-red-500" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {addingDelegation && (
            <div className="rounded-xl p-3 border-2 border-dashed space-y-2" style={{ borderColor: "#AEDFF7" }}>
              <p className="text-xs font-semibold text-gray-700">Nouvelle personne autorisée</p>
              {([["Nom *", "nom", "Nom complet"], ["Téléphone *", "telephone", "06 00 00 00 00"], ["CIN", "cin", "CIN"], ["Relation", "relation", "Ex: Grand-mère"]] as [string, keyof typeof newDelegationForm, string][]).map(([label, field, ph]) => (
                <div key={field}>
                  <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                  <Input value={newDelegationForm[field]} onChange={e => setNewDelegationForm(prev => ({ ...prev, [field]: e.target.value }))} placeholder={ph} className="h-8 text-sm" />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={handleAddDelegation} disabled={delegationSaving || !newDelegationForm.nom || !newDelegationForm.telephone} className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50" style={{ background: "#FF6F61" }}>{delegationSaving ? "..." : "Ajouter"}</button>
                <button type="button" onClick={() => { setAddingDelegation(false); setNewDelegationForm({ nom: "", telephone: "", cin: "", relation: "" }) }} className="flex-1 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#EAF5FB", color: "#6B7280", border: "1px solid #C5E8F7" }}>Annuler</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health profile */}
      <Card className="border shadow-sm rounded-2xl" style={{ borderColor: "#AEDFF7" }}>
        <CardHeader className="pb-3 border-b" style={{ borderColor: "#AEDFF7" }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900">🏥 Profil santé</CardTitle>
            <div className="flex gap-2">
              {!editingSante && (
                <button type="button" onClick={() => { setEditingSante(true); setSanteSaveMsg(null) }} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "#EAF5FB", color: "#1A1A1A", border: "1px solid #C5E8F7" }}>
                  <Pencil className="w-3 h-3 inline mr-1" />{sante ? "Modifier" : "Créer"}
                </button>
              )}
              {sante && !editingSante && (
                <button type="button" onClick={handleDeleteSante} disabled={santeDeleting} className="text-xs font-medium px-3 py-1.5 rounded-lg text-red-600" style={{ background: "#FFF0EE", border: "1px solid #FFD4CE" }}>{santeDeleting ? "..." : "Supprimer"}</button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {santeSaveMsg && <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ background: "#EAF5FB", color: "#1A1A1A" }}>{santeSaveMsg}</p>}
          {santeLoading ? (
            <p className="text-sm text-gray-400 text-center py-4 animate-pulse">Chargement…</p>
          ) : editingSante ? (
            <div className="space-y-3">
              {[["Médecin traitant", "medecin", "Nom du médecin"], ["Restriction alimentaire", "restrictionAlimentaire", "Ex: Sans gluten…"]] .map(([label, field, ph]) => (
                <div key={field}>
                  <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
                  <Input value={santeForm[field as "medecin"|"restrictionAlimentaire"]} onChange={e => setSanteForm(f => ({ ...f, [field]: e.target.value }))} placeholder={ph} className="h-9 text-sm" />
                </div>
              ))}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-500">Allergies</p>
                  <button type="button" onClick={() => setSanteForm(f => ({ ...f, allergies: [...f.allergies, { nom: "", severite: "" }] }))} className="text-xs" style={{ color: "#FF6F61" }}>+ Ajouter</button>
                </div>
                {santeForm.allergies.map((a, i) => (
                  <div key={i} className="flex gap-1.5 items-center mb-1.5">
                    <Input value={a.nom} onChange={e => setSanteForm(f => ({ ...f, allergies: f.allergies.map((x, j) => j===i ? { ...x, nom: e.target.value } : x) }))} placeholder="Nom allergie" className="h-8 text-sm flex-1" />
                    <Input value={a.severite ?? ""} onChange={e => setSanteForm(f => ({ ...f, allergies: f.allergies.map((x, j) => j===i ? { ...x, severite: e.target.value } : x) }))} placeholder="Sévérité" className="h-8 text-sm w-24" />
                    <button type="button" onClick={() => setSanteForm(f => ({ ...f, allergies: f.allergies.filter((_, j) => j !== i) }))} className="p-1"><X className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-500">Intolérances</p>
                  <button type="button" onClick={() => setSanteForm(f => ({ ...f, intolerances: [...f.intolerances, { nom: "" }] }))} className="text-xs" style={{ color: "#FF6F61" }}>+ Ajouter</button>
                </div>
                {santeForm.intolerances.map((inv, i) => (
                  <div key={i} className="flex gap-1.5 items-center mb-1.5">
                    <Input value={inv.nom} onChange={e => setSanteForm(f => ({ ...f, intolerances: f.intolerances.map((x, j) => j===i ? { nom: e.target.value } : x) }))} placeholder="Nom intolérance" className="h-8 text-sm flex-1" />
                    <button type="button" onClick={() => setSanteForm(f => ({ ...f, intolerances: f.intolerances.filter((_, j) => j !== i) }))} className="p-1"><X className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                <textarea value={santeForm.notes} onChange={e => setSanteForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes médicales…" rows={2} className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1" style={{ borderColor: "#C5E8F7" }} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={handleSaveSante} disabled={santeSaving} className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60" style={{ background: "#FF6F61" }}>{santeSaving ? "Enregistrement…" : "Enregistrer"}</button>
                <button type="button" onClick={() => setEditingSante(false)} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "#EAF5FB", color: "#6B7280", border: "1px solid #C5E8F7" }}>Annuler</button>
              </div>
            </div>
          ) : sante ? (
            <div className="space-y-3">
              {(sante.medecin as string) && <p className="text-sm text-gray-700">👨‍⚕️ {sante.medecin as string}</p>}
              {(sante.restrictionAlimentaire as string) && <p className="text-sm text-gray-700">🍽️ {sante.restrictionAlimentaire as string}</p>}
              {Array.isArray(sante.allergies) && (sante.allergies as {nom:string;severite?:string}[]).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-600 mb-1">⚠️ Allergies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(sante.allergies as {nom:string;severite?:string}[]).map((a, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#FFF0EE", color: "#D93025", border: "1px solid #FFD4CE" }}>{a.nom}{a.severite ? " ("+a.severite+")" : ""}</span>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(sante.intolerances) && (sante.intolerances as {nom:string}[]).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-orange-600 mb-1">Intolérances</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(sante.intolerances as {nom:string}[]).map((inv, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FFF4ED", color: "#C05621", border: "1px solid #FED7AA" }}>{inv.nom}</span>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(sante.tags) && (sante.tags as string[]).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(sante.tags as string[]).map((tag, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#EAF5FB", color: "#1A73A7", border: "1px solid #C5E8F7" }}>{tag}</span>
                  ))}
                </div>
              )}
              {(sante.notes as string) && <p className="text-sm text-gray-600 italic">{`"${sante.notes as string}"`}</p>}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">Aucun profil santé enregistré.</p>
              <button type="button" onClick={() => setEditingSante(true)} className="mt-2 text-xs hover:underline" style={{ color: "#FF6F61" }}>Créer un profil santé</button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parent profile edit */}
      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardHeader className="pb-3 border-b" style={{ borderColor: "#AEDFF7" }}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-gray-900">👤 Mes informations</CardTitle>
            {!editingProfile
              ? <button type="button" onClick={() => setEditingProfile(true)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "#EAF5FB", color: "#1A1A1A", border: "1px solid #C5E8F7" }}><Pencil className="w-3 h-3" /> Modifier</button>
              : <div className="flex gap-2">
                  <button type="button" onClick={handleSaveProfile} disabled={profileSaving} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-white disabled:opacity-60" style={{ background: "#FF6F61" }}><Check className="w-3 h-3" /> {profileSaving?"...":"Sauvegarder"}</button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "#EAF5FB", color: "#6B7280", border: "1px solid #C5E8F7" }}><X className="w-3 h-3" /> Annuler</button>
                </div>}
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {profileSaveMsg && <p className="text-xs font-medium text-green-700 mb-3 px-3 py-2 rounded-lg bg-green-50">{profileSaveMsg}</p>}
          {profileSaveErr && <p className="text-xs text-red-600 mb-3 px-3 py-2 rounded-lg bg-red-50">{profileSaveErr}</p>}
          {tuteurs.length > 0 && (
            <div className="space-y-3">
              {tuteurs.map((tt, i) => (
                <div key={tt.id} className="rounded-xl p-3" style={{ background: "#EAF5FB", border: "1px solid #C5E8F7" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#1A1A1A" }}>
                    {i===0?"Responsable principal":"Tuteur "+(i+1)}
                    {tt.lien && <span className="ml-2 font-normal text-gray-500">({tt.lien})</span>}
                  </p>
                  {(tt.prenom||tt.nom) && <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{[tt.prenom,tt.nom].filter(Boolean).join(" ")}</p>}
                  {tt.email && <p className="text-sm mt-0.5 text-gray-500">✉️ {tt.email}</p>}
                  {editingProfile && i===0 ? (
                    <div className="space-y-2 mt-2">
                      <div><p className="text-xs font-medium mb-1 text-gray-500">Téléphone</p><Input value={editTelephone} onChange={e=>setEditTelephone(e.target.value)} placeholder="06 00 00 00 00" className="h-9 text-sm" /></div>
                      <div><p className="text-xs font-medium mb-1 text-gray-500">Adresse</p><Input value={editAdresse} onChange={e=>setEditAdresse(e.target.value)} placeholder="Votre adresse" className="h-9 text-sm" /></div>
                    </div>
                  ) : (
                    <div className="mt-1 space-y-0.5">
                      {tt.telephone && <p className="text-sm text-gray-500">📞 {tt.telephone}</p>}
                      {tt.adresse && <p className="text-sm text-gray-500">📍 {tt.adresse}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                <Button onClick={handlePasswordChange} size="sm" className="flex-1 text-white" style={{ background: "#FF6F61" }}>Enregistrer</Button>
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
      <Card className="shadow-md rounded-2xl" style={{ border: "2px solid #AEDFF7", background: "linear-gradient(to bottom, rgba(174,223,247,0.12), white)" }}>
        <CardHeader className="pb-3 border-b" style={{ borderColor: "#AEDFF7" }}>
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2"><span>🍽️</span> Menu du jour</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {todayMenu ? (
            <div className="space-y-3">
              <p className="text-xs font-medium" style={{ color: "#1A1A1A", opacity: 0.6 }}>{new Date(todayMenu.date).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" })}</p>
              {[
                { icon: "🥛", label: "Collation matin",  value: todayMenu.entree },
                { icon: "🍗", label: "Repas",            value: todayMenu.plat },
                { icon: "🍎", label: "Goûter",           value: todayMenu.dessert },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex items-start gap-3 py-2 border-t first:border-0 first:pt-0" style={{ borderColor: "rgba(174,223,247,0.5)" }}>
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
        <Card className="border shadow-sm rounded-2xl" style={{ borderColor: "#AEDFF7" }}>
          <CardHeader className="pb-3 border-b" style={{ borderColor: "#AEDFF7" }}>
            <CardTitle className="text-sm font-bold text-gray-900">📋 Menus de la semaine</CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            {Object.values(weekMenus).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((menu: any) => (
              <div key={menu.date} className="rounded-xl p-3" style={{ background: "rgba(174,223,247,0.1)", border: "1px solid rgba(174,223,247,0.4)" }}>
                <p className="text-xs font-bold mb-2 uppercase" style={{ color: "#1A1A1A" }}>{new Date(menu.date).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "short" })}</p>
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
            <div key={ev.id} className="flex items-start gap-3 rounded-2xl bg-white shadow-sm p-4" style={{ border: "1px solid #C5E8F7" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 text-center leading-tight" style={{ background: "#AEDFF7", color: "#1A1A1A" }}>{ev.date}</div>
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
    <div className="min-h-screen pb-20 md:pb-8" style={{ background: "#FFFFFF" }}>
      {/* Desktop tab bar */}
      <div className="hidden md:block sticky top-0 z-40 border-b" style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(8px)", borderColor: "#C5E8F7" }}>
        <div className="max-w-2xl mx-auto px-4 flex gap-1 py-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id
            return (
              <button key={item.id} type="button" onClick={() => setActiveTab(item.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={isActive ? { background: "#AEDFF7", color: "#1A1A1A" } : { color: "#6B7280" }}>
                {item.icon}<span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pt-4 md:pt-6">
        {activeTab === "home"     && <HomeTab />}
        {activeTab === "presence" && <PresenceTab />}
        {activeTab === "child"    && <ChildTab />}
        {activeTab === "menu"     && <MenuTab />}
        {activeTab === "events"   && <EventsTab />}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(10px)", borderColor: "#C5E8F7", paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id
            return (
              <button key={item.id} type="button" onClick={() => setActiveTab(item.id)}
                className={"flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all "+(isActive?"":"text-gray-400")}
                style={isActive ? { color: "#FF6F61" } : {}}>
                <span style={{ transform: isActive ? "scale(1.1)" : "scale(1)", transition: "transform 0.15s" }}>{item.icon}</span>
                <span className="text-[10px] font-medium" style={isActive ? { color: "#FF6F61" } : {}}>{item.label}</span>
                {isActive && <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#FF6F61" }} />}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
