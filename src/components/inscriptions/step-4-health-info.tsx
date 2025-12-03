"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step4Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step4HealthInfo({ formData, updateFormData }: Step4Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-1">
          <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.5 1.5H9.5a.5.5 0 00-.5.5v1H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2h-4V2a.5.5 0 00-.5-.5zM5 5h10v10H5V5zm1.5 1a.5.5 0 10-1 0 .5.5 0 001 0z" />
          </svg>
          Fiche de santé
        </h2>
        <p className="text-sm text-muted-foreground">Informations médicales de l'enfant</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height" className="text-sm font-medium">
            Taille (cm)
          </Label>
          <Input
            id="height"
            placeholder="Ex: 105"
            value={formData.height}
            onChange={(e) => updateFormData({ height: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="weight" className="text-sm font-medium">
            Poids (kg)
          </Label>
          <Input
            id="weight"
            placeholder="Ex: 18"
            value={formData.weight}
            onChange={(e) => updateFormData({ weight: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="familyHistory" className="text-sm font-medium">
          Antécédents familiaux
        </Label>
        <textarea
          id="familyHistory"
          placeholder="Décrivez les antécédents familiaux pertinents..."
          value={formData.familyHistory}
          onChange={(e) => updateFormData({ familyHistory: e.target.value })}
          className="w-full mt-2 p-3 border border-border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-24"
        />
      </div>

      <div>
        <Label htmlFor="chronicDisease" className="text-sm font-medium">
          Maladie chronique
        </Label>
        <Input
          id="chronicDisease"
          placeholder="Non / Oui, précisez"
          value={formData.chronicDisease}
          onChange={(e) => updateFormData({ chronicDisease: e.target.value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="medications" className="text-sm font-medium">
          Médicaments
        </Label>
        <Input
          id="medications"
          placeholder="Non / Oui, précisez"
          value={formData.medications}
          onChange={(e) => updateFormData({ medications: e.target.value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="allergies" className="text-sm font-medium">
          Allergies
        </Label>
        <Input
          id="allergies"
          placeholder="Non / Oui, précisez"
          value={formData.allergies}
          onChange={(e) => updateFormData({ allergies: e.target.value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="surgicalInterventions" className="text-sm font-medium">
          Interventions chirurgicales
        </Label>
        <Input
          id="surgicalInterventions"
          placeholder="Non / Oui, précisez"
          value={formData.surgicalInterventions}
          onChange={(e) => updateFormData({ surgicalInterventions: e.target.value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="remarks" className="text-sm font-medium">
          Remarques particulières
        </Label>
        <textarea
          id="remarks"
          placeholder="Ajoutez toute autre information pertinente..."
          value={formData.remarks}
          onChange={(e) => updateFormData({ remarks: e.target.value })}
          className="w-full mt-2 p-3 border border-border rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-24"
        />
      </div>
    </div>
  )
}
