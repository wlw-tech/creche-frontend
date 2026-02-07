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
  const [childResumes, setChildResumes] = useState<Record<string, { id: string }>>({})
  const [dailySummary, setDailySummary] = useState("")
  const [dailyMessage, setDailyMessage] = useState("")
  const [teacherDailyMessage, setTeacherDailyMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [savingResume, setSavingResume] = useState(false)

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

        // Récupérer toutes les présences pour aujourd'hui (avec pagination si nécessaire)
        let allPresences: any[] = []
        let currentPage = 1
        const pageSize = 100
        let hasMore = true
        
        while (hasMore && !cancelled) {
          const presRes = await apiClient.getPresences(cls.id, today, currentPage, pageSize)
          const presItems = presRes.data?.items ?? presRes.data?.data ?? []
          
          if (!Array.isArray(presItems) || presItems.length === 0) {
            hasMore = false
            break
          }
          
          allPresences = [...allPresences, ...presItems]
          
          // Vérifier s'il y a plus de pages
          const hasNext = presRes.data?.hasNext ?? false
          if (!hasNext || presItems.length < pageSize) {
            hasMore = false
          } else {
            currentPage++
          }
        }
        
        if (!cancelled) {
          const map: Record<string, "Present" | "Absent"> = {}
          for (const p of allPresences) {
            // L'API retourne enfant.id ou enfantId selon la structure
            const enfantId = p.enfantId || p.enfant?.id
            if (enfantId && p.statut) {
              map[enfantId] = p.statut
            }
          }
          setAttendanceData(map)
          
          // Vérifier si tous les enfants ont déjà une présence pour aujourd'hui
          const hasPresenceForAll =
            enfants.length > 0 &&
            enfants.every((enfant: any) => map[enfant.id] !== undefined)

          if (hasPresenceForAll) {
            setSuccessMessage("Toutes les présences sont déjà enregistrées pour aujourd'hui. Vous pouvez consulter le résumé de journée.");
          }
        }

        const resumesRes = await apiClient.getResumes(cls.id, today)
        const resumes = resumesRes.data?.data ?? resumesRes.data ?? []
        if (!cancelled && Array.isArray(resumes)) {
          const map: Record<string, { id: string }> = {}
          for (const r of resumes) {
            if (r.enfantId && r.id) {
              map[r.enfantId] = { id: r.id }
            }
          }
          setChildResumes(map)
        }
      } catch (e: any) {
        console.error("[Teacher] loadData error", e)
        if (!cancelled) {
          if (e?.response?.status === 401) {
            setError("Session expirée. Merci de vous reconnecter.")
            if (typeof window !== "undefined") {
              const pathname = window.location.pathname || "";
              const isArabic = pathname.startsWith("/ar");
              const targetLocale = isArabic ? "ar" : "fr";
              window.location.href = `/${targetLocale}`;
            }
          } else {
            setError("Impossible de charger les données")
          }
        }
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
    
    // Vérifier si la présence est déjà faite
    if (attendanceData[currentChild.id] !== undefined) {
      setError("La présence pour cet enfant a déjà été enregistrée aujourd'hui.")
      return
    }
    
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

      // Mettre à jour l'état local immédiatement
      setAttendanceData((prev) => ({ ...prev, [currentChild.id]: presence }))
      setError(null)
      setSuccessMessage(
        `Présence enregistrée pour ${currentChild.prenom ?? ""} ${currentChild.nom ?? ""}`.trim(),
      )
      setTimeout(() => setSuccessMessage(null), 3000)
      
      // Recharger les présences depuis l'API pour confirmer
      try {
        const presRes = await apiClient.getPresences(teacherClass.id, today, 1, 100)
        const presItems = presRes.data?.items ?? presRes.data?.data ?? []
        if (Array.isArray(presItems)) {
          const map: Record<string, "Present" | "Absent"> = { ...attendanceData }
          for (const p of presItems) {
            const enfantId = p.enfantId || p.enfant?.id
            if (enfantId && p.statut) {
              map[enfantId] = p.statut
            }
          }
          setAttendanceData(map)
        }
      } catch (reloadError) {
        console.error("[Teacher] Error reloading presences", reloadError)
        // Ne pas bloquer si le rechargement échoue, l'état local est déjà mis à jour
      }
    } catch (e) {
      console.error("[Teacher] handlePresence error", e)
      setError("Erreur lors de l'enregistrement de la présence")
    }
  }

  const handleSaveDailySummary = async () => {
    if (!teacherClass || !currentChild) return

    // Mapping des choix UI vers les enums Prisma (NiveauAppetit, etc.)
    // Ne mapper que si la valeur est définie, sinon undefined (les champs sont optionnels dans le DTO)
    const appetitEnum = appetit
      ? appetit === "Bien"
        ? "Bon"
        : appetit === "Moyen"
          ? "Moyen"
          : appetit === "Mal"
            ? "Faible"
            : undefined
      : undefined
    const humeurEnum = humeur
      ? humeur === "Bonne"
        ? "Bon"
        : humeur === "Moyenne"
          ? "Moyen"
          : humeur === "Mauvaise"
            ? "Difficile"
            : undefined
      : undefined
    const siesteEnum = sieste
      ? sieste === "Courte"
        ? "Moyen"
        : sieste === "Moyenne"
          ? "Bon"
          : sieste === "Longue"
            ? "Excellent"
            : undefined
      : undefined
    const participationEnum = participation
      ? participation === "Bonne"
        ? "Bon"
        : participation === "Moyenne"
          ? "Moyen"
          : participation === "Faible"
            ? "Faible"
            : undefined
      : undefined

    // Date au format ISO pour IsDateString (ex: 2025-12-08T00:00:00.000Z)
    // Le format YYYY-MM-DD devrait aussi fonctionner avec IsDateString
    const isoDate = `${today}T00:00:00.000Z`

    const resumeText = `Appétit: ${appetit}, Humeur: ${humeur}, Sieste: ${sieste}, Participation: ${participation}`

    try {
      setSavingResume(true)
      const existing = childResumes[currentChild.id]

      // Construire le payload en excluant les valeurs undefined
      const resumePayload: any = {
        observations: dailyMessage ? [dailyMessage] : [],
      }
      if (appetitEnum) resumePayload.appetit = appetitEnum
      if (humeurEnum) resumePayload.humeur = humeurEnum
      if (siesteEnum) resumePayload.sieste = siesteEnum
      if (participationEnum) resumePayload.participation = participationEnum

      if (existing && existing.id) {
        await apiClient.updateResume(existing.id, resumePayload)
      } else {
        const res = await apiClient.createResume({
          enfantId: currentChild.id,
          date: isoDate,
          ...resumePayload,
        })

        const createdId = res.data?.id ?? res.data?.resumeId ?? null
        if (createdId) {
          setChildResumes((prev) => ({ ...prev, [currentChild.id]: { id: createdId } }))
        }
      }

      setDailySummary(resumeText)
      setSuccessMessage("Résumé de journée enregistré avec succès")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (e: any) {
      console.error("[Teacher] handleSaveDailySummary error", e)
      const errorMessage = e.response?.data?.message || e.message || "Erreur lors de l'enregistrement du résumé"
      setError(errorMessage)
      // Si un résumé existe déjà, mettre à jour l'état local pour permettre la modification
      if (errorMessage.includes("existe déjà")) {
        // Recharger les résumés existants pour cet enfant
        try {
          const resumesRes = await apiClient.getResumes(teacherClass.id, today)
          const resumes = resumesRes.data?.data ?? resumesRes.data ?? []
          if (Array.isArray(resumes)) {
            const existingResume = resumes.find((r: any) => r.enfantId === currentChild.id)
            if (existingResume) {
              setChildResumes((prev) => ({ ...prev, [currentChild.id]: { id: existingResume.id } }))
            }
          }
        } catch (reloadError) {
          console.error("[Teacher] Error reloading resumes", reloadError)
        }
      }
    } finally {
      setSavingResume(false)
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
    const current = currentChild
    if (!current) return

    // Autoriser le passage à l'enfant suivant dès que la présence est enregistrée.
    // Si toutes les présences du jour sont déjà enregistrées (par ex. déjà faites plus tôt),
    // autoriser aussi la navigation.
    const hasPresence = attendanceData[current.id] !== undefined
    if (hasPresence || isAttendanceCompletedForToday) {
      if (currentChildIndex < children.length - 1) {
        setCurrentChildIndex((i) => i + 1)
        setError(null)
      }
      return
    }

    setError("Veuillez enregistrer la présence avant de continuer.")
  }

  const handlePrevious = () => {
    if (currentChildIndex > 0) {
      setCurrentChildIndex((i) => i - 1)
    }
  }

  const isAllProcessed =
    children.length > 0 &&
    children.every((enfant) => attendanceData[enfant.id] !== undefined && !!childResumes[enfant.id])

  const hasPresenceForCurrent =
    currentChild && attendanceData[currentChild.id] !== undefined
  const hasResumeForCurrent = currentChild && !!childResumes[currentChild.id]
  const progressPercent = children.length > 0 ? ((currentChildIndex + 1) / children.length) * 100 : 0

  // Vérifier si la présence du jour est déjà terminée pour tous les enfants
  const isAttendanceCompletedForToday = 
    children.length > 0 && 
    children.every((enfant) => attendanceData[enfant.id] !== undefined)

  const canNavigateToSummary = isAllProcessed || isAttendanceCompletedForToday
  
  // Charger le résumé existant pour l'enfant actuel si disponible
  useEffect(() => {
    if (!currentChild || !teacherClass) return
    const classeId = teacherClass.id
    
    async function loadCurrentChildResume() {
      try {
        const resumesRes = await apiClient.getResumes(classeId, today)
        const resumes = resumesRes.data?.data ?? resumesRes.data ?? []
        const currentResume = Array.isArray(resumes) 
          ? resumes.find((r: any) => r.enfantId === currentChild.id)
          : null
        
        if (currentResume) {
          // Charger les valeurs du résumé existant
          let loadedAppetit: "Bien" | "Moyen" | "Mal" = "Bien"
          let loadedHumeur: "Bonne" | "Moyenne" | "Mauvaise" = "Bonne"
          let loadedSieste: "Courte" | "Moyenne" | "Longue" = "Moyenne"
          let loadedParticipation: "Bonne" | "Moyenne" | "Faible" = "Bonne"
          
          if (currentResume.appetit) {
            const appetitMap: Record<string, "Bien" | "Moyen" | "Mal"> = {
              "Bon": "Bien",
              "Moyen": "Moyen",
              "Faible": "Mal"
            }
            loadedAppetit = appetitMap[currentResume.appetit] || "Bien"
            setAppetit(loadedAppetit)
          }
          if (currentResume.humeur) {
            const humeurMap: Record<string, "Bonne" | "Moyenne" | "Mauvaise"> = {
              "Bon": "Bonne",
              "Moyen": "Moyenne",
              "Difficile": "Mauvaise"
            }
            loadedHumeur = humeurMap[currentResume.humeur] || "Bonne"
            setHumeur(loadedHumeur)
          }
          if (currentResume.sieste) {
            const siesteMap: Record<string, "Courte" | "Moyenne" | "Longue"> = {
              "Moyen": "Courte",
              "Bon": "Moyenne",
              "Excellent": "Longue"
            }
            loadedSieste = siesteMap[currentResume.sieste] || "Moyenne"
            setSieste(loadedSieste)
          }
          if (currentResume.participation) {
            const participationMap: Record<string, "Bonne" | "Moyenne" | "Faible"> = {
              "Bon": "Bonne",
              "Moyen": "Moyenne",
              "Faible": "Faible"
            }
            loadedParticipation = participationMap[currentResume.participation] || "Bonne"
            setParticipation(loadedParticipation)
          }
          if (currentResume.observations && Array.isArray(currentResume.observations) && currentResume.observations.length > 0) {
            setDailyMessage(currentResume.observations[0])
          }
          
          const resumeText = `Appétit: ${loadedAppetit}, Humeur: ${loadedHumeur}, Sieste: ${loadedSieste}, Participation: ${loadedParticipation}`
          setDailySummary(resumeText)
        } else {
          // Réinitialiser si pas de résumé
          setDailySummary("")
          setDailyMessage("")
        }
      } catch (e) {
        console.error("[Teacher] Error loading current child resume", e)
      }
    }
    
    void loadCurrentChildResume()
  }, [currentChild?.id, teacherClass?.id, today])

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
        <Link href="/">
          <Button
            variant="outline"
            className="rounded-lg bg-transparent border border-gray-300 font-medium text-xs md:text-sm"
          >
            ← Retour
          </Button>
        </Link>
      </div>

      {successMessage && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-800">
          {successMessage}
          {successMessage.includes("Présence déjà enregistrée") && (
            <div className="mt-3">
              <Link href="/teacher/summary">
                <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Voir le résumé de journée
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Layout principal : enfant à gauche, résumé de journée à droite */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : enfant + infos */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl lg:col-span-1">
          <CardContent className="pt-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-sky-500 text-white flex items-center justify-center text-xl font-bold">
                {currentChild?.prenom?.[0] ?? "A"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {`${currentChild?.prenom ?? ""} ${currentChild?.nom ?? ""}`.trim()}
                </h2>
                <p className="text-xs text-gray-600 mt-1">{teacherClass.nom}</p>
              </div>
            </div>

            {currentChild && (
            <>
              <div className="mt-3 flex gap-3">
                <Button
                  type="button"
                  onClick={() => handlePresence("Present")}
                  disabled={attendanceData[currentChild.id] !== undefined}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {t("presentButton")}
                </Button>
                <Button
                  type="button"
                  onClick={() => handlePresence("Absent")}
                  disabled={attendanceData[currentChild.id] !== undefined}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {t("absentButton")}
                </Button>
              </div>

                <div className="mt-2 text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full border">
                  {attendanceData[currentChild.id] !== undefined && childResumes[currentChild.id] ? (
                    <span className="text-emerald-700 border-emerald-300 bg-emerald-50">
                      ✓ Présence & résumé faits
                    </span>
                  ) : (
                    <span className="text-amber-700 border-amber-300 bg-amber-50">
                      À faire pour cet enfant
                    </span>
                  )}
                </div>
              </>
            )}

            {Array.isArray(currentChild?.allergies) && currentChild.allergies.length > 0 && (
              <p className="text-xs font-bold text-red-600 mt-2">
                🚨 {currentChild.allergies.join(", ")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Colonne droite : résumé de journée avec 4 cartes */}
        <Card className="border border-gray-200 shadow-sm rounded-2xl lg:col-span-2">
          <CardContent className="pt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base md:text-lg font-bold text-gray-900">
                {t("daySummaryTitle")}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Appétit */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col items-center gap-2">
                <div className="text-3xl">🍽️</div>
                <p className="text-xs text-gray-500">Appétit</p>
                <p className="text-lg font-bold text-emerald-600">{appetit}</p>
                <div className="mt-2 flex gap-2">
                  {["Bien", "Moyen", "Mal"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAppetit(opt as typeof appetit)}
                      className={`px-2 py-1 text-xs rounded-full border ${
                        appetit === opt
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Humeur */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col items-center gap-2">
                <div className="text-3xl">😊</div>
                <p className="text-xs text-gray-500">Humeur</p>
                <p className="text-lg font-bold text-sky-600">{humeur}</p>
                <div className="mt-2 flex gap-2">
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
              </div>

              {/* Sieste */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col items-center gap-2">
                <div className="text-3xl">😴</div>
                <p className="text-xs text-gray-500">Sieste</p>
                <p className="text-lg font-bold text-gray-700">{sieste}</p>
                <div className="mt-2 flex gap-2">
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
              </div>

              {/* Participation */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col items-center gap-2">
                <div className="text-3xl">⭐</div>
                <p className="text-xs text-gray-500">Participation</p>
                <p className="text-lg font-bold text-emerald-600">{participation}</p>
                <div className="mt-2 flex gap-2">
                  {["Bonne", "Moyenne", "Faible"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setParticipation(opt as typeof participation)}
                      className={`px-2 py-1 text-xs rounded-full border ${
                        participation === opt
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Infos de résumé et bouton */}
            {dailySummary && (
              <div className="pt-2 text-xs text-gray-500 text-center">
                Note du jour : {dailySummary}
              </div>
            )}

            {hasResumeForCurrent && (
              <div className="pt-2 text-xs text-emerald-600 text-center font-medium">
                ✓ Résumé de journée déjà enregistré pour cet enfant
              </div>
            )}

            {!hasResumeForCurrent && (
              <div className="pt-3 flex justify-end">
                <Button
                  onClick={handleSaveDailySummary}
                  disabled={savingResume || !hasPresenceForCurrent}
                  className={`text-sm px-4 py-2 rounded-lg ${
                    savingResume
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-sky-500 hover:bg-sky-600 text-white"
                  }`}
                >
                  {savingResume ? "Enregistrement..." : "Valider le résumé de journée"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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

        {canNavigateToSummary ? (
          <Link href="/teacher/summary">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-9 py-3 mx-2-semibold text-sm">
              {t("summaryCta")} →
            </Button>
          </Link>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!hasPresenceForCurrent && !isAttendanceCompletedForToday}
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
