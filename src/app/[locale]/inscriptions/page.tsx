"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StepIndicator from "@/components/inscriptions/step-indicator"
import Step1ChildInfo from "@/components/inscriptions/step-1-child-info"
import Step2ParentInfo from "@/components/inscriptions/step-2-parent-info"
import Step3AuthorizedPersons from "@/components/inscriptions/step-3-authorized-persons"
import Step4HealthInfo from "@/components/inscriptions/step-4-health-info"
import Step5Regulations from "@/components/inscriptions/step-5-regulations"
import SuccessScreen from "@/components/inscriptions/success-screen"
import { apiClient } from "@/lib/api"
import { usePathname } from "next/navigation"

export default function InscriptionsPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const pathname = usePathname()
  const [classes, setClasses] = useState<{ id: string; nom: string }[]>([])
  const [classesError, setClassesError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // ── Step 1: Child ──────────────────────────────────────────────────────
    childFirstName: "",
    childLastName: "",
    dateOfBirth: "",
    fraternity: "",
    rankInFraternity: "",
    selectedActivities: [] as string[],
    classeIdSouhaitee: "",
    childPhotoBase64: "",
    childPhotoFile: "",

    // ── Step 2: Parents ────────────────────────────────────────────────────
    motherFirstName: "",
    motherLastName: "",
    motherPhone: "",
    motherEmail: "",
    motherAddress: "",
    motherProfession: "",
    motherCin: "",
    fatherFirstName: "",
    fatherLastName: "",
    fatherPhone: "",
    fatherEmail: "",
    fatherAddress: "",
    fatherProfession: "",
    fatherCin: "",
    familySituation: "",
    responsablePrincipal: "mother" as "mother" | "father",
    declarationHonneur: false,

    // ── Step 3: Authorized Persons ─────────────────────────────────────────
    sansRestriction: false,
    authorizedPersons: [] as { name: string; relationship: string; phone: string; cin: string }[],

    // ── Step 4: Health ────────────────────────────────────────────────────
    height: "",
    weight: "",
    familyHistory: "",
    tagsMaladies: [] as string[],
    tagsAllergies: [] as string[],
    tagsIntolerances: [] as string[],
    healthTags: [] as string[],
    restrictionAlimentaire: "sans_restriction",
    restrictionDetails: "",
    surgicalInterventions: "",
    remarks: "",

    // ── Step 5: Regulations ────────────────────────────────────────────────
    regulationsAccepted: false,
    confirmationExacte: false,
  })

  useEffect(() => {
    let cancelled = false
    async function fetchClasses() {
      try {
        setClassesError(null)
        const res = await apiClient.listPublicClasses()
        const data = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : []
        if (!cancelled) {
          setClasses(data.map((c: any) => ({ id: c.id, nom: c.nom })))
        }
      } catch (err) {
        console.error("[Inscriptions] Error loading classes", err)
        if (!cancelled) {
          setClassesError("Impossible de charger la liste des classes. Vous pouvez tout de même continuer.")
        }
      }
    }
    fetchClasses()
    return () => { cancelled = true }
  }, [])

  const handleNext = () => {
    setSubmitError(null)

    if (currentStep === 1) {
      if (!formData.childFirstName.trim()) {
        setSubmitError("Le prénom de l'enfant est obligatoire.")
        return
      }
      if (!formData.childLastName.trim()) {
        setSubmitError("Le nom de l'enfant est obligatoire.")
        return
      }
      if (!formData.dateOfBirth) {
        setSubmitError("La date de naissance est obligatoire.")
        return
      }
      if (!formData.classeIdSouhaitee) {
        setSubmitError("Veuillez sélectionner une classe souhaitée.")
        return
      }
    }

    if (currentStep === 2) {
      const hasMotherInfo = formData.motherFirstName.trim() || formData.motherEmail.trim() || formData.motherPhone.trim()
      const hasFatherInfo = formData.fatherFirstName.trim() || formData.fatherEmail.trim() || formData.fatherPhone.trim()
      if (!hasMotherInfo && !hasFatherInfo) {
        setSubmitError("Veuillez renseigner les informations d'au moins un parent.")
        return
      }
      if (!formData.motherEmail.trim() && !formData.fatherEmail.trim()) {
        setSubmitError("L'email d'au moins un parent est obligatoire.")
        return
      }
      if (!formData.declarationHonneur) {
        setSubmitError("La déclaration sur l'honneur est obligatoire.")
        return
      }
    }

    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!formData.regulationsAccepted || !formData.confirmationExacte) {
      setSubmitError("Veuillez cocher les deux cases obligatoires en bas du formulaire.")
      return
    }
    if (!formData.declarationHonneur) {
      setSubmitError("La déclaration sur l'honneur est obligatoire (étape 2).")
      return
    }

    const primaryEmail = formData.motherEmail || formData.fatherEmail
    if (!primaryEmail) {
      setSubmitError("Veuillez renseigner au moins l'email d'un parent.")
      return
    }
    if (!formData.classeIdSouhaitee) {
      setSubmitError("Veuillez sélectionner une classe souhaitée.")
      return
    }

    setSubmitError(null)

    try {
      const isArabic = pathname?.startsWith("/ar")
      const locale = isArabic ? "ar" : "fr"

      const tuteurs: any[] = []

      if (formData.motherFirstName || formData.motherLastName || formData.motherEmail) {
        tuteurs.push({
          lien: "Mere",
          prenom: formData.motherFirstName,
          nom: formData.motherLastName,
          email: formData.motherEmail || undefined,
          telephone: formData.motherPhone || undefined,
          cin: formData.motherCin || undefined,
          principal: formData.responsablePrincipal === "mother",
        })
      }

      if (formData.fatherFirstName || formData.fatherLastName || formData.fatherEmail) {
        tuteurs.push({
          lien: "Pere",
          prenom: formData.fatherFirstName,
          nom: formData.fatherLastName,
          email: formData.fatherEmail || undefined,
          telephone: formData.fatherPhone || undefined,
          cin: formData.fatherCin || undefined,
          principal: formData.responsablePrincipal === "father",
        })
      }

      const payload = {
        famille: {
          emailPrincipal: primaryEmail,
          languePreferee: locale,
          adresseFacturation: formData.motherAddress || formData.fatherAddress || undefined,
        },
        tuteurs,
        enfant: {
          prenom: formData.childFirstName,
          nom: formData.childLastName,
          dateNaissance: formData.dateOfBirth,
          photoUrl: formData.childPhotoBase64 || undefined,
        },
        classeIdSouhaitee: formData.classeIdSouhaitee,
        sante: {
          taille: formData.height || undefined,
          poids: formData.weight || undefined,
          antecedentsFamiliaux: formData.familyHistory || undefined,
          tagsMaladies: formData.tagsMaladies,
          tagsAllergies: formData.tagsAllergies,
          tagsIntolerances: formData.tagsIntolerances,
          tags: formData.healthTags,
          restrictionAlimentaire: formData.restrictionAlimentaire || "sans_restriction",
          restrictionDetails: formData.restrictionDetails || undefined,
          interventionsChirurgicales: formData.surgicalInterventions || undefined,
        },
        restrictions: {
          sansRestriction: formData.sansRestriction,
          personnesAutorisees: formData.sansRestriction
            ? []
            : formData.authorizedPersons.filter((p) => p.name),
        },
        commentaire: formData.remarks || undefined,
        declarationHonneur: formData.declarationHonneur,
        confirmationExacte: formData.confirmationExacte,
      }

      await apiClient.createPublicInscription(payload)
      setIsSubmitted(true)
    } catch (error: any) {
      console.error("[Inscriptions] Error submitting inscription", error)
      const apiMessage = error?.response?.data?.message
      if (Array.isArray(apiMessage)) {
        setSubmitError(apiMessage.join(" "))
      } else if (typeof apiMessage === "string") {
        setSubmitError(apiMessage)
      } else {
        setSubmitError("Une erreur est survenue. Veuillez vérifier les informations et réessayer.")
      }
    }
  }

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const canSubmit =
    formData.regulationsAccepted &&
    formData.confirmationExacte

  if (isSubmitted) {
    return <SuccessScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S14.33 6 13.5 6 12 6.67 12 7.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S7.33 6 6.5 6 5 6.67 5 7.5 5.67 9 6.5 9zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H4.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground">Inscription — PetitsPas</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Crèche-Maternelle</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 md:mb-8">
          <StepIndicator currentStep={currentStep} totalSteps={5} />
        </div>

        {/* Form Content */}
        <Card className="p-4 md:p-8 border border-border/60 shadow-sm">
          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {submitError}
            </div>
          )}
          {classesError && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
              {classesError}
            </div>
          )}

          {currentStep === 1 && (
            <Step1ChildInfo formData={formData} updateFormData={updateFormData} classes={classes} />
          )}
          {currentStep === 2 && (
            <Step2ParentInfo formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <Step3AuthorizedPersons formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <Step4HealthInfo formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <Step5Regulations formData={formData} updateFormData={updateFormData} />
          )}

          {/* Navigation */}
          <div className="flex gap-3 justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-5"
            >
              ← Précédent
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                className="bg-primary text-primary-foreground px-5 hover:bg-primary/90"
              >
                Suivant →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="bg-secondary text-secondary-foreground px-5 hover:bg-secondary/90 disabled:opacity-50"
              >
                Soumettre le dossier
              </Button>
            )}
          </div>
        </Card>

        {/* Progress hint */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Étape {currentStep} / 5 — Toutes les données sont sécurisées et confidentielles.
        </p>
      </div>
    </div>
  )
}
