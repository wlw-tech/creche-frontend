"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step2Props {
  formData: any
  updateFormData: (data: any) => void
}

function ParentSection({
  title,
  prefix,
  formData,
  updateFormData,
  isResponsable,
  onSetResponsable,
}: {
  title: string
  prefix: "mother" | "father"
  formData: any
  updateFormData: (data: any) => void
  isResponsable: boolean
  onSetResponsable: () => void
}) {
  const f = (name: string) => `${prefix}${name.charAt(0).toUpperCase() + name.slice(1)}`

  return (
    <div className="space-y-4 pb-6 border-b border-border last:border-0 last:pb-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="responsablePrincipal"
            checked={isResponsable}
            onChange={onSetResponsable}
            className="w-4 h-4 accent-primary"
          />
          <span className={`text-xs font-medium ${isResponsable ? "text-primary" : "text-muted-foreground"}`}>
            {isResponsable ? "✓ Responsable principal" : "Définir comme responsable principal"}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Prénom</Label>
          <Input
            placeholder="Ex : Amina"
            value={formData[f("firstName")] ?? ""}
            onChange={(e) => updateFormData({ [f("firstName")]: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Nom</Label>
          <Input
            placeholder="Ex : Tazi"
            value={formData[f("lastName")] ?? ""}
            onChange={(e) => updateFormData({ [f("lastName")]: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">
            CIN <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Ex : AB123456"
            value={formData[f("Cin")] ?? ""}
            onChange={(e) => updateFormData({ [f("Cin")]: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Téléphone</Label>
          <Input
            placeholder="Ex : 0612345678"
            value={formData[f("Phone")] ?? ""}
            onChange={(e) => updateFormData({ [f("Phone")]: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">
            E-mail {prefix === "mother" ? <span className="text-red-500">*</span> : null}
          </Label>
          <Input
            type="email"
            placeholder="Ex : parent@email.com"
            value={formData[f("Email")] ?? ""}
            onChange={(e) => updateFormData({ [f("Email")]: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Profession</Label>
          <Input
            placeholder="Ex : Médecin"
            value={formData[f("Profession")] ?? ""}
            onChange={(e) => updateFormData({ [f("Profession")]: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Adresse</Label>
        <Input
          placeholder="Ex : 123 Rue de la Paix, Casablanca"
          value={formData[f("Address")] ?? ""}
          onChange={(e) => updateFormData({ [f("Address")]: e.target.value })}
          className="mt-1"
        />
      </div>
    </div>
  )
}

export default function Step2ParentInfo({ formData, updateFormData }: Step2Props) {
  const familySituations = ["Mariés", "Divorcés", "Séparés", "Union libre"]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-1">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
          Informations des parents / tuteurs
        </h2>
        <p className="text-sm text-muted-foreground">
          Désignez le responsable principal. L'email et le CIN sont obligatoires.
          Les champs marqués <span className="text-red-500">*</span> sont requis.
        </p>
      </div>

      <ParentSection
        title="Mère"
        prefix="mother"
        formData={formData}
        updateFormData={updateFormData}
        isResponsable={formData.responsablePrincipal === "mother"}
        onSetResponsable={() => updateFormData({ responsablePrincipal: "mother" })}
      />

      <ParentSection
        title="Père"
        prefix="father"
        formData={formData}
        updateFormData={updateFormData}
        isResponsable={formData.responsablePrincipal === "father"}
        onSetResponsable={() => updateFormData({ responsablePrincipal: "father" })}
      />

      {/* Situation familiale */}
      <div>
        <Label className="text-sm font-medium">Situation familiale</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {familySituations.map((situation) => (
            <label
              key={situation}
              className={`flex items-center justify-center p-2.5 rounded-lg border cursor-pointer transition-all text-sm font-medium text-center ${
                formData.familySituation === situation
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-background border-border hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                name="familySituation"
                value={situation}
                checked={formData.familySituation === situation}
                onChange={(e) => updateFormData({ familySituation: e.target.value })}
                className="sr-only"
              />
              {situation}
            </label>
          ))}
        </div>
      </div>

      {/* Déclaration sur l'honneur */}
      <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 space-y-3">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
          <span>⚖️</span> Déclaration sur l'honneur
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
          Cette déclaration est requise pour valider votre dossier d'inscription.
        </p>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={formData.declarationHonneur ?? false}
            onChange={(e) => updateFormData({ declarationHonneur: e.target.checked })}
            className="w-5 h-5 rounded accent-amber-600 mt-0.5 flex-shrink-0"
          />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-400 leading-relaxed">
            Je soussigné(e), représentant(e) légal(e) de l'enfant, déclare sur l'honneur l'exactitude
            des informations fournies dans ce formulaire d'inscription.{" "}
            <span className="text-red-500">*</span>
          </span>
        </label>
      </div>
    </div>
  )
}
