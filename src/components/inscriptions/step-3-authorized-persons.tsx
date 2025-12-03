"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step3Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step3AuthorizedPersons({ formData, updateFormData }: Step3Props) {
  const handlePersonChange = (index: number, field: string, value: string) => {
    const updated = [...formData.authorizedPersons]
    updated[index] = { ...updated[index], [field]: value }
    updateFormData({ authorizedPersons: updated })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-1">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
          Personnes autorisées
        </h2>
        <p className="text-sm text-muted-foreground">Personnes autorisées à récupérer l'enfant</p>
      </div>

      <div className="space-y-6">
        {formData.authorizedPersons.map((person: any, index: number) => (
          <div key={index} className="p-4 rounded-lg border border-border bg-muted/30">
            <h3 className="font-medium text-foreground mb-4">Personne autorisée {index + 1}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`name-${index}`} className="text-sm font-medium">
                  Nom et prénom
                </Label>
                <Input
                  id={`name-${index}`}
                  placeholder="Ex: Fatima Bennani"
                  value={person.name}
                  onChange={(e) => handlePersonChange(index, "name", e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor={`relationship-${index}`} className="text-sm font-medium">
                  Lien de parenté
                </Label>
                <Input
                  id={`relationship-${index}`}
                  placeholder="Ex: Tante"
                  value={person.relationship}
                  onChange={(e) => handlePersonChange(index, "relationship", e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor={`phone-${index}`} className="text-sm font-medium">
                  Téléphone
                </Label>
                <Input
                  id={`phone-${index}`}
                  placeholder="Ex: 0634567890"
                  value={person.phone}
                  onChange={(e) => handlePersonChange(index, "phone", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
