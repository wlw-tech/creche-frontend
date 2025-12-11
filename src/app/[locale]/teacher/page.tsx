"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { apiClient } from "@/lib/api"

type Enfant = {
  id: string
  prenom?: string | null
  nom?: string | null
  allergies?: string[] | null
}

type Classe = {
  id: string
  nom: string
}

export default function TeacherDashboard() {
  const t = useTranslations("teacher.dashboard")

  const [teacherClass, setTeacherClass] = useState<Classe | null>(null)
  const [children, setChildren] = useState<Enfant[]>([])
  const [currentChildIndex, setCurrentChildIndex] = useState(0)
  const [attendanceData, setAttendanceData] = useState<Record<string, "Present" | "Absent">>({})
  const [dailySummary, setDailySummary] = useState("")
  const [dailyMessage, setDailyMessage] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Résumé de journée (sélection simple sur 3 niveaux)
  const [appetit, setAppetit] = useState<"Bien" | "Moyen" | "Mal">("Bien")
  const [humeur, setHumeur] = useState<"Bonne" | "Moyenne" | "Mauvaise">("Bonne")
  const [sieste, setSieste] = useState<"Courte" | "Moyenne" | "Longue">("Moyenne")
  const [participation, setParticipation] = useState<"Bonne" | "Moyenne" | "Faible">("Bonne")

  const currentChild = children[currentChildIndex] ?? null
  const today = new Date().toISOString().slice(0, 10)

  // Format d'en-tête de présence du jour (ex: "Présence du 29/09 — 08:35")
  const now = new Date()
  const presenceHeader = `Présence du ${now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  })} — ${now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const classesRes = await apiClient.listClasses()
        const classes = classesRes.data?.data ?? classesRes.data ?? []

        if (!classes.length) {
          if (!cancelled) setError("Aucune classe disponible")
          return
        }

        const cls: Classe = classes[0]
        if (!cancelled) setTeacherClass({ id: cls.id, nom: cls.nom })

        const enfantsRes = await apiClient.getClassWithChildren(cls.id)
        const enfants = enfantsRes.data?.enfants ?? []
        if (!cancelled) setChildren(enfants)

        const presRes = await apiClient.getPresences(cls.id, today)
        const presItems = presRes.data?.items ?? presRes.data?.data ?? []
        if (!cancelled) {
          const map: Record<string, "Present" | "Absent"> = {}
          for (const p of presItems) {
            if (p.enfantId && p.statut) {
              map[p.enfantId] = p.statut
            }
          }
          setAttendanceData(map)
        }

        const resumesRes = await apiClient.getResumes(cls.id, today)
        const resumes = resumesRes.data?.data ?? resumesRes.data ?? []
        const first = resumes[0]
        if (!cancelled && first) {
          setDailySummary(first.resume ?? "")
          setDailyMessage(first.message ?? "")
        }
      } catch (e) {
        console.error("[Teacher] loadData error", e)
        if (!cancelled) setError("Impossible de charger les données")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadData()
    return () => {
      cancelled = true
    }
  }, [today])

  const handlePresence = async (presence: "Present" | "Absent") => {
    if (!currentChild || !teacherClass) return
    try {
      await apiClient.recordPresences({
        classeId: teacherClass.id,
        date: today,
        presences: [
          {
            enfantId: currentChild.id,
            statut: presence,
            arriveeA: presence === "Present" ? new Date().toTimeString().slice(0, 5) : null,
            departA: null,
          },
        ],
      })

      setAttendanceData((prev) => ({ ...prev, [currentChild.id]: presence }))
      setSuccessMessage(
        `Présence enregistrée pour ${currentChild.prenom ?? ""} ${currentChild.nom ?? ""}`.trim(),
      )
      setTimeout(() => setSuccessMessage(null), 3000)
      handleNext()
    } catch (e) {
      console.error("[Teacher] handlePresence error", e)
      setError("Erreur lors de l'enregistrement de la présence")
    }
  }

  const handleSaveDailySummary = async () => {
    if (!teacherClass || !currentChild) return

    // Mapping des choix UI vers les enums Prisma (NiveauAppetit, etc.)
    const appetitEnum =
      appetit === "Bien" ? "Bon" : appetit === "Moyen" ? "Moyen" : "Faible"
    const humeurEnum =
      humeur === "Bonne" ? "Bon" : humeur === "Moyenne" ? "Moyen" : "Difficile"
    const siesteEnum =
      sieste === "Courte" ? "Moyen" : sieste === "Moyenne" ? "Bon" : "Excellent"
    const participationEnum =
      participation === "Bonne"
        ? "Bon"
        : participation === "Moyenne"
          ? "Moyen"
          : "Faible"

    // Date complète ISO pour IsDateString (ex: 2025-12-08T00:00:00.000Z)
    const isoDate = `${today}T00:00:00.000Z`

    const resumeText = `Appétit: ${appetit}, Humeur: ${humeur}, Sieste: ${sieste}, Participation: ${participation}`

    try {
      await apiClient.createResume({
        enfantId: currentChild.id,
        date: isoDate,
        appetit: appetitEnum,
        humeur: humeurEnum,
        sieste: siesteEnum,
        participation: participationEnum,
        observations: dailyMessage ? [dailyMessage] : [],
      })

      setDailySummary(resumeText)
      setSuccessMessage("Résumé de journée enregistré avec succès")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (e) {
      console.error("[Teacher] handleSaveDailySummary error", e)
      setError("Erreur lors de l'enregistrement du résumé")
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      setPasswordError("Les mots de passe ne correspondent pas")
      return
    }
    try {
      await apiClient.changeAuthPassword(passwords.current, passwords.new, passwords.confirm)
      setPasswordMessage("Mot de passe changé avec succès")
      setPasswordError(null)
      setPasswords({ current: "", new: "", confirm: "" })
      setShowPasswordForm(false)
      setTimeout(() => setPasswordMessage(null), 3000)
    } catch (e) {
      console.error("[Teacher] handlePasswordChange error", e)
      setPasswordError("Erreur lors du changement de mot de passe")
    }
  }

  const handleNext = () => {
    if (currentChildIndex < children.length - 1) {
      setCurrentChildIndex((i) => i + 1)
    }
  }

  const handlePrevious = () => {
    if (currentChildIndex > 0) {
      setCurrentChildIndex((i) => i - 1)
    }
  }

  const isAllProcessed = children.length > 0 && currentChildIndex === children.length - 1
  const progressPercent = children.length > 0 ? ((currentChildIndex + 1) / children.length) * 100 : 0

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Chargement du tableau de bord enseignant...</div>
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>
  }

  if (!teacherClass) {
    return <div className="p-6 text-sm text-gray-600">Aucune classe assignée.</div>
  }

  if (!children.length) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Aucun enfant dans la classe {teacherClass.nom}.
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-6 lg:px-0 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{teacherClass.nom}</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            {children.length} {children.length > 1 ? "élèves" : "élève"}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Child Card */}
        <div className="lg:col-span-1">
          <Card className="border-2 border-sky-200 bg-white shadow-md h-full rounded-2xl">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Child Info */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-200 to-sky-300 flex items-center justify-center text-2xl md:text-3xl font-bold text-sky-700 flex-shrink-0">
                    {(currentChild?.prenom ?? currentChild?.nom ?? "?").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {`${currentChild?.prenom ?? ""} ${currentChild?.nom ?? ""}`.trim()}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{teacherClass.nom}</p>
                    {Array.isArray(currentChild?.allergies) && currentChild.allergies.length > 0 && (
                      <p className="text-xs font-bold text-red-600 mt-2">
                        🚨 {currentChild.allergies.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Presence Time */}
                <div className="text-xs text-gray-600 font-medium">{presenceHeader}</div>

                {/* Attendance Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePresence("Present")}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg py-3 text-base"
                  >
                    ✓ {t("presentButton")}
                  </Button>
                  <Button
                    onClick={() => handlePresence("Absent")}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg py-3 text-base"
                  >
                    ✕ {t("absentButton")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Daily Summary */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-gray-200 shadow-sm rounded-2xl">
            <CardContent className="pt-4 space-y-3">
              <h3 className="text-lg font-bold text-gray-900">{t("daySummaryTitle")}</h3>

              {/* Summary Cards Grid (Appétit, Humeur, Sieste, Participation) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Appétit */}
                <Card className="border border-gray-200 shadow-sm rounded-2xl group overflow-hidden">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {appetit === "Bien" ? "🍽️" : appetit === "Moyen" ? "😐" : "🤢"}
                      </div>
                      <p className="text-xs font-medium text-gray-600">Appétit</p>
                      <p className="text-lg font-bold text-green-600 mt-1">{appetit}</p>
                    </div>
                    <div className="mt-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {["Bien", "Moyen", "Mal"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAppetit(opt as typeof appetit)}
                          className={`px-2 py-1 text-xs rounded-full border ${
                            appetit === opt
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Humeur */}
                <Card className="border border-gray-200 shadow-sm rounded-2xl group overflow-hidden">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {humeur === "Bonne" ? "😊" : humeur === "Moyenne" ? "😐" : "😢"}
                      </div>
                      <p className="text-xs font-medium text-gray-600">Humeur</p>
                      <p className="text-lg font-bold text-sky-500 mt-1">{humeur}</p>
                    </div>
                    <div className="mt-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {["Bonne", "Moyenne", "Mauvaise"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setHumeur(opt as typeof humeur)}
                          className={`px-2 py-1 text-xs rounded-full border ${
                            humeur === opt
                              ? "bg-sky-500 text-white border-sky-500"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sieste */}
                <Card className="border border-gray-200 shadow-sm rounded-2xl group overflow-hidden">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {sieste === "Courte" ? "😴" : sieste === "Moyenne" ? "😌" : "🛌"}
                      </div>
                      <p className="text-xs font-medium text-gray-600">Sieste</p>
                      <p className="text-lg font-bold text-gray-700 mt-1">{sieste}</p>
                    </div>
                    <div className="mt-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {["Courte", "Moyenne", "Longue"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSieste(opt as typeof sieste)}
                          className={`px-2 py-1 text-xs rounded-full border ${
                            sieste === opt
                              ? "bg-gray-700 text-white border-gray-700"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Participation */}
                <Card className="border border-gray-200 shadow-sm rounded-2xl group overflow-hidden">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {participation === "Bonne" ? "⭐" : participation === "Moyenne" ? "✨" : "⚪"}
                      </div>
                      <p className="text-xs font-medium text-gray-600">Participation</p>
                      <p className="text-lg font-bold text-green-600 mt-1">{participation}</p>
                    </div>
                    <div className="mt-3 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {["Bonne", "Moyenne", "Faible"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setParticipation(opt as typeof participation)}
                          className={`px-2 py-1 text-xs rounded-full border ${
                            participation === opt
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {dailySummary && (
                <div className="pt-2 text-xs text-gray-500 text-center">
                  Note du jour : {dailySummary}
                </div>
              )}

              <div className="pt-3 flex justify-end">
                <Button
                  onClick={handleSaveDailySummary}
                  className="bg-sky-500 hover:bg-sky-600 text-white text-sm px-4 py-2 rounded-lg"
                >
                  Valider le résumé de journée
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation & Progress */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          onClick={handlePrevious}
          disabled={currentChildIndex === 0}
          className="text-gray-700 border border-gray-300 rounded-lg px-5 py-2 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← {t("prev")}
        </Button>

        <div className="flex-1 mx-8 flex items-center gap-5 ">
          <div className="flex-1">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-600 whitespace-nowrap ">
            {currentChildIndex + 1} / {children.length}
          </span>
        </div>

        {isAllProcessed ? (
          <Link href="/teacher/summary">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-9 py-3 mx-2-semibold text-sm">
              {t("summaryCta")} →
            </Button>
          </Link>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-7 py-2 mx-5 emibold text-sm"
          >
            {t("next")} →
          </Button>
        )}
      </div>

      {/* Sécurité / Changement de mot de passe (une seule fois en bas de page) */}
      <div className="mt-6">
        <Card className="border border-gray-200 shadow-sm rounded-2xl max-w-3xl mx-auto">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Sécurité</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm((v) => !v)}
              >
                Changer mon mot de passe
              </Button>
            </div>

            {passwordMessage && (
              <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
                {passwordMessage}
              </div>
            )}
            {passwordError && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {passwordError}
              </div>
            )}

            {showPasswordForm && (
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Label>Ancien mot de passe</Label>
                  <Input
                    type="password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, current: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Nouveau mot de passe</Label>
                  <Input
                    type="password"
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, new: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Confirmation</Label>
                  <Input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
                    }
                  />
                </div>
                <div className="md:col-span-3">
                  <Button
                    onClick={handlePasswordChange}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    Valider
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
