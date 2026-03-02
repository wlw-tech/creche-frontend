"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"

interface Step4Props {
  formData: any
  updateFormData: (data: any) => void
}

// ─── Predefined tag lists ───────────────────────────────────────────────────
const TAGS_MALADIES = [
  "Asthme", "Épilepsie", "Diabète type 1", "Diabète type 2",
  "Drépanocytose", "Cardiopathie", "Hémophilie", "Mucoviscidose",
  "Hypothyroïdie", "Autisme / TSA", "TDAH", "Eczéma",
  "Prématuré", "Handicap moteur", "Handicap visuel", "Autre",
]

const TAGS_ALLERGIES = [
  "Arachides", "Lait", "Œufs", "Fruits de mer", "Poisson",
  "Gluten (blé)", "Soja", "Fruits à coque", "Sésame",
  "Latex", "Pénicilline", "Pollen", "Autre",
]

const TAGS_INTOLERANCES = [
  "Lactose", "Gluten", "Fructose", "Sucre (saccharose)",
  "Colorants alimentaires", "Conservateurs", "Glutamate (MSG)",
  "Histamine", "Arachide", "Autre",
]

const TAGS_SANTE = [
  "Suivi médical régulier", "Port de lunettes", "Appareil auditif",
  "Troubles du langage", "Troubles du comportement", "Troubles du sommeil",
  "Traitement en cours", "Kinésithérapie", "Orthophonie",
]

// ─── TagSelector component ──────────────────────────────────────────────────
function TagSelector({
  label,
  description,
  predefined,
  selected,
  onToggle,
  onAddCustom,
  onRemoveCustom,
  color = "primary",
}: {
  label: string
  description?: string
  predefined: string[]
  selected: string[]
  onToggle: (tag: string) => void
  onAddCustom: (tag: string) => void
  onRemoveCustom: (tag: string) => void
  color?: string
}) {
  const [customInput, setCustomInput] = useState("")

  const handleAdd = () => {
    const trimmed = customInput.trim()
    if (!trimmed || selected.includes(trimmed)) return
    onAddCustom(trimmed)
    setCustomInput("")
  }

  const customTags = selected.filter((t) => !predefined.includes(t))

  return (
    <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>

      {/* Predefined tags */}
      <div className="flex flex-wrap gap-2">
        {predefined.map((tag) => {
          const isSelected = selected.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all font-medium ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background border-border text-foreground hover:border-primary/60 hover:bg-primary/5"
              }`}
            >
              {isSelected && <span className="mr-1">✓</span>}
              {tag}
            </button>
          )
        })}
      </div>

      {/* Custom added tags */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-secondary/20 border border-secondary/40 text-foreground font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveCustom(tag)}
                className="text-muted-foreground hover:text-destructive ml-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add custom tag */}
      <div className="flex gap-2">
        <Input
          placeholder="Ajouter un tag personnalisé…"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          className="h-8 text-xs"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!customInput.trim()}
          className="flex items-center gap-1 px-3 h-8 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <Plus className="w-3 h-3" />
          Ajouter
        </button>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function Step4HealthInfo({ formData, updateFormData }: Step4Props) {
  // Tag helpers ──────────────────────────────────────────────────────────────
  const makeToggle = (field: string) => (tag: string) => {
    const current: string[] = formData[field] ?? []
    updateFormData({
      [field]: current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
    })
  }

  const makeAddCustom = (field: string) => (tag: string) => {
    const current: string[] = formData[field] ?? []
    if (!current.includes(tag)) updateFormData({ [field]: [...current, tag] })
  }

  const makeRemoveCustom = (field: string) => (tag: string) => {
    const current: string[] = formData[field] ?? []
    updateFormData({ [field]: current.filter((t) => t !== tag) })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-1">
          <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.5 1.5H9.5a.5.5 0 00-.5.5v1H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-4V2a.5.5 0 00-.5-.5zM5 5h10v10H5V5z" />
          </svg>
          Fiche de santé
        </h2>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les tags correspondant à la situation médicale de l'enfant. Vous pouvez ajouter des tags personnalisés.
        </p>
      </div>

      {/* Mesures */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height" className="text-sm font-medium">Taille (cm)</Label>
          <Input
            id="height"
            placeholder="Ex : 105"
            value={formData.height ?? ""}
            onChange={(e) => updateFormData({ height: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="weight" className="text-sm font-medium">Poids (kg)</Label>
          <Input
            id="weight"
            placeholder="Ex : 18"
            value={formData.weight ?? ""}
            onChange={(e) => updateFormData({ weight: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      {/* Antécédents familiaux */}
      <div>
        <Label htmlFor="familyHistory" className="text-sm font-medium">
          Antécédents familiaux
        </Label>
        <textarea
          id="familyHistory"
          placeholder="Décrivez les antécédents familiaux pertinents (facultatif)…"
          value={formData.familyHistory ?? ""}
          onChange={(e) => updateFormData({ familyHistory: e.target.value })}
          className="w-full mt-1 p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none"
        />
      </div>

      {/* ── PART 1: TAG SYSTEM ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Santé — Sélection par tags
        </p>

        {/* Maladies chroniques */}
        <TagSelector
          label="Maladies chroniques"
          description="Sélectionnez les maladies connues ou diagnostiquées"
          predefined={TAGS_MALADIES}
          selected={formData.tagsMaladies ?? []}
          onToggle={makeToggle("tagsMaladies")}
          onAddCustom={makeAddCustom("tagsMaladies")}
          onRemoveCustom={makeRemoveCustom("tagsMaladies")}
        />

        {/* Allergies */}
        <TagSelector
          label="Allergies"
          description="Réactions immunitaires documentées (alimentaires, médicamenteuses, environnementales)"
          predefined={TAGS_ALLERGIES}
          selected={formData.tagsAllergies ?? []}
          onToggle={makeToggle("tagsAllergies")}
          onAddCustom={makeAddCustom("tagsAllergies")}
          onRemoveCustom={makeRemoveCustom("tagsAllergies")}
        />

        {/* Intolérances */}
        <TagSelector
          label="Intolérances alimentaires"
          description="Différentes des allergies : troubles digestifs sans réaction immunitaire"
          predefined={TAGS_INTOLERANCES}
          selected={formData.tagsIntolerances ?? []}
          onToggle={makeToggle("tagsIntolerances")}
          onAddCustom={makeAddCustom("tagsIntolerances")}
          onRemoveCustom={makeRemoveCustom("tagsIntolerances")}
        />

        {/* Tags santé généraux */}
        <TagSelector
          label="Suivi & accompagnement"
          description="Autres informations pertinentes pour l'équipe pédagogique"
          predefined={TAGS_SANTE}
          selected={formData.healthTags ?? []}
          onToggle={makeToggle("healthTags")}
          onAddCustom={makeAddCustom("healthTags")}
          onRemoveCustom={makeRemoveCustom("healthTags")}
        />
      </div>

      {/* ── PART 2: RESTRICTIONS ─────────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
        <p className="text-sm font-semibold text-foreground">Restrictions alimentaires</p>
        <div className="space-y-2">
          {[
            { value: "sans_restriction", label: "Aucune restriction" },
            { value: "sans_porc", label: "Sans porc / halal" },
            { value: "vegetarien", label: "Végétarien" },
            { value: "sans_gluten", label: "Sans gluten" },
            { value: "autre", label: "Autre (précisez)" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="restrictionAlimentaire"
                value={opt.value}
                checked={formData.restrictionAlimentaire === opt.value}
                onChange={() => updateFormData({ restrictionAlimentaire: opt.value })}
                className="w-4 h-4 accent-primary"
              />
              <span className="text-sm group-hover:text-primary transition-colors">{opt.label}</span>
            </label>
          ))}
        </div>
        {formData.restrictionAlimentaire === "autre" && (
          <Input
            placeholder="Précisez la restriction alimentaire…"
            value={formData.restrictionDetails ?? ""}
            onChange={(e) => updateFormData({ restrictionDetails: e.target.value })}
            className="mt-2"
          />
        )}
      </div>

      {/* Interventions chirurgicales */}
      <div>
        <Label htmlFor="surgicalInterventions" className="text-sm font-medium">
          Interventions chirurgicales
        </Label>
        <Input
          id="surgicalInterventions"
          placeholder="Non / Oui, précisez"
          value={formData.surgicalInterventions ?? ""}
          onChange={(e) => updateFormData({ surgicalInterventions: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* Remarques */}
      <div>
        <Label htmlFor="remarks" className="text-sm font-medium">
          Remarques particulières
        </Label>
        <textarea
          id="remarks"
          placeholder="Toute autre information utile pour l'équipe…"
          value={formData.remarks ?? ""}
          onChange={(e) => updateFormData({ remarks: e.target.value })}
          className="w-full mt-1 p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] resize-none"
        />
      </div>

      {/* Summary badges */}
      {(() => {
        const all = [
          ...(formData.tagsMaladies ?? []),
          ...(formData.tagsAllergies ?? []),
          ...(formData.tagsIntolerances ?? []),
          ...(formData.healthTags ?? []),
        ]
        if (all.length === 0) return null
        return (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs font-semibold text-primary mb-2">
              {all.length} tag(s) sélectionné(s)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {all.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
