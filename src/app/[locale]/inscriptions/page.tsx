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
    // Step 1: Child Info
    childFirstName: "",
    childLastName: "",
    dateOfBirth: "",
    fraternity: "",
    rankInFraternity: "",
    selectedGroup: "",
    selectedActivities: [] as string[],
    classeIdSouhaitee: "",

    // Step 2: Parent Info
    motherFirstName: "",
    motherLastName: "",
    motherPhone: "",
    motherEmail: "",
    motherAddress: "",
    motherProfession: "",
    fatherFirstName: "",
    fatherLastName: "",
    fatherPhone: "",
    fatherEmail: "",
    fatherAddress: "",
    fatherProfession: "",
    familySituation: "",

    // Step 3: Authorized Persons
    authorizedPersons: [
      { name: "", relationship: "", phone: "" },
      { name: "", relationship: "", phone: "" },
      { name: "", relationship: "", phone: "" },
      { name: "", relationship: "", phone: "" },
    ],

    // Step 4: Health Info
    height: "",
    weight: "",
    familyHistory: "",
    chronicDisease: "",
    medications: "",
    allergies: "",
    surgicalInterventions: "",
    remarks: "",

    // Step 5: Regulations
    regulationsAccepted: false,
  })

  useEffect(() => {
    let cancelled = false

    async function fetchClasses() {
      try {
        setClassesError(null)
        const res = await apiClient.listClasses()
        const data = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data)
          ? res.data
          : []
        if (!cancelled) {
          setClasses(
            data.map((c: any) => ({
              id: c.id,
              nom: c.nom,
            })),
          )
        }
      } catch (err) {
        console.error("[Inscriptions] Error loading classes", err)
        if (!cancelled) {
          setClassesError("Impossible de charger la liste des classes. Vous pouvez tout de même continuer.")
        }
      }
    }

    fetchClasses()

    return () => {
      cancelled = true
    }
  }, [])

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!formData.regulationsAccepted) return

    // validation minimale côté client
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
          principal: true,
        })
      }

      if (formData.fatherFirstName || formData.fatherLastName || formData.fatherEmail) {
        tuteurs.push({
          lien: "Pere",
          prenom: formData.fatherFirstName,
          nom: formData.fatherLastName,
          email: formData.fatherEmail || undefined,
          telephone: formData.fatherPhone || undefined,
          principal: !tuteurs.length,
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
        },
        classeIdSouhaitee: formData.classeIdSouhaitee,
        commentaire: formData.remarks || formData.allergies || undefined,
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
        setSubmitError("Une erreur est survenue lors de l'envoi de l'inscription. Veuillez vérifier les informations et réessayer.")
      }
    }
  }

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  if (isSubmitted) {
    return <SuccessScreen />
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S14.33 6 13.5 6 12 6.67 12 7.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S7.33 6 6.5 6 5 6.67 5 7.5 5.67 9 6.5 9zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H4.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Inscription à Le Nido</h1>
            <p className="text-sm text-muted-foreground">Crèche-Maternelle</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} totalSteps={5} />
        </div>

        {/* Form Content */}
        <Card className="p-6 md:p-8 border-2 border-border/50">
          {submitError && (
            <p className="mb-4 text-sm text-red-600 font-medium">{submitError}</p>
          )}
          {classesError && (
            <p className="mb-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              {classesError}
            </p>
          )}
          {currentStep === 1 && (
            <Step1ChildInfo
              formData={formData}
              updateFormData={updateFormData}
              classes={classes}
            />
          )}
          {currentStep === 2 && <Step2ParentInfo formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <Step3AuthorizedPersons formData={formData} updateFormData={updateFormData} />}
          {currentStep === 4 && <Step4HealthInfo formData={formData} updateFormData={updateFormData} />}
          {currentStep === 5 && <Step5Regulations formData={formData} updateFormData={updateFormData} />}

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 bg-transparent"
            >
              Précédent
            </Button>

            {currentStep < 5 ? (
              <Button onClick={handleNext} className="bg-primary text-primary-foreground px-6 hover:bg-primary/90">
                Suivant
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!formData.regulationsAccepted}
                className="bg-secondary text-secondary-foreground px-6 hover:bg-secondary/90"
              >
                Soumettre l'inscription
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
