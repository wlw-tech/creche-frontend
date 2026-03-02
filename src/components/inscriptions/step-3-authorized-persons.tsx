"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, UserCheck } from "lucide-react"

interface AuthorizedPerson {
  name: string
  relationship: string
  phone: string
  cin: string
}

interface Step3Props {
  formData: any
  updateFormData: (data: any) => void
}

const RELATION_OPTIONS = [
  "Grand-mère", "Grand-père", "Tante", "Oncle",
  "Frère aîné", "Sœur aînée", "Cousin(e)", "Voisin(e)", "Employé(e) de maison", "Autre",
]

export default function Step3AuthorizedPersons({ formData, updateFormData }: Step3Props) {
  const persons: AuthorizedPerson[] = formData.authorizedPersons ?? []
  const sansRestriction: boolean = formData.sansRestriction ?? false

  const handlePersonChange = (index: number, field: keyof AuthorizedPerson, value: string) => {
    const updated = [...persons]
    updated[index] = { ...updated[index], [field]: value }
    updateFormData({ authorizedPersons: updated })
  }

  const handleAddPerson = () => {
    updateFormData({
      authorizedPersons: [
        ...persons,
        { name: "", relationship: "", phone: "", cin: "" },
      ],
    })
  }

  const handleRemovePerson = (index: number) => {
    updateFormData({
      authorizedPersons: persons.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-1">
          <UserCheck className="w-5 h-5 text-primary" />
          Restrictions de récupération
        </h2>
        <p className="text-sm text-muted-foreground">
          Personnes autorisées à récupérer l'enfant en dehors des parents / tuteurs légaux.
        </p>
      </div>

      {/* Sans restriction toggle */}
      <div className={`p-4 rounded-xl border-2 transition-colors ${
        sansRestriction
          ? "border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950/20"
          : "border-border bg-muted/20"
      }`}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={sansRestriction}
            onChange={(e) => updateFormData({ sansRestriction: e.target.checked })}
            className="w-5 h-5 rounded accent-green-600 mt-0.5 flex-shrink-0"
          />
          <div>
            <span className={`text-sm font-semibold ${sansRestriction ? "text-green-800 dark:text-green-400" : "text-foreground"}`}>
              Sans restriction — Toute personne peut récupérer l'enfant
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Si cochée, aucune liste de délégation n'est requise.
            </p>
          </div>
        </label>
      </div>

      {/* Delegation list */}
      {!sansRestriction && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-semibold text-foreground">
              Liste des personnes autorisées
            </p>
            <button
              type="button"
              onClick={handleAddPerson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter une personne
            </button>
          </div>

          {persons.length === 0 ? (
            <div className="text-center py-8 rounded-xl border-2 border-dashed border-border text-muted-foreground">
              <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucune personne autorisée ajoutée.</p>
              <p className="text-xs mt-1">Cliquez sur "Ajouter une personne" pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {persons.map((person, index) => (
                <div key={index} className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Personne autorisée {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(index)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium">Nom complet <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="Ex : Fatima Bennani"
                        value={person.name}
                        onChange={(e) => handlePersonChange(index, "name", e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Lien avec l'enfant <span className="text-red-500">*</span></Label>
                      <select
                        value={person.relationship}
                        onChange={(e) => handlePersonChange(index, "relationship", e.target.value)}
                        className="mt-1 w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">— Choisir —</option>
                        {RELATION_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium">Téléphone <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="Ex : 0634567890"
                        value={person.phone}
                        onChange={(e) => handlePersonChange(index, "phone", e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">CIN <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="Ex : AB123456"
                        value={person.cin}
                        onChange={(e) => handlePersonChange(index, "cin", e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground italic">
            Seules les personnes listées seront autorisées à récupérer l'enfant. Une pièce d'identité sera exigée.
          </p>
        </div>
      )}
    </div>
  )
}
