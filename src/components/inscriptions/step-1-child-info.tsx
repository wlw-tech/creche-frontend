"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step1Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step1ChildInfo({ formData, updateFormData }: Step1Props) {
  const activities = ["Garderie de 16h45 à 18h", "Atelier du mercredi"]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-1">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
          Informations de l'enfant
        </h2>
        <p className="text-sm text-muted-foreground">Informations générales sur l'enfant</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="childFirstName" className="text-sm font-medium">
            Prénom de l'enfant
          </Label>
          <Input
            id="childFirstName"
            placeholder="Ex: Mohammed Amine"
            value={formData.childFirstName}
            onChange={(e) => updateFormData({ childFirstName: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="childLastName" className="text-sm font-medium">
            Nom de l'enfant
          </Label>
          <Input
            id="childLastName"
            placeholder="Ex: Bennani"
            value={formData.childLastName}
            onChange={(e) => updateFormData({ childLastName: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="dateOfBirth" className="text-sm font-medium">
            Date de naissance
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="fraternity" className="text-sm font-medium">
            Fratrie
          </Label>
          <Input
            id="fraternity"
            placeholder="Ex: 3"
            value={formData.fraternity}
            onChange={(e) => updateFormData({ fraternity: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="rankInFraternity" className="text-sm font-medium">
            Rang dans la fratrie
          </Label>
          <Input
            id="rankInFraternity"
            placeholder="Ex: 3"
            value={formData.rankInFraternity}
            onChange={(e) => updateFormData({ rankInFraternity: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="classeIdSouhaitee" className="text-sm font-medium">
          Classe souhaitée (ID) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="classeIdSouhaitee"
          placeholder="Ex: f47ac10b-58cc-4372-a567-0e02b2c3d479"
          value={formData.classeIdSouhaitee}
          onChange={(e) => updateFormData({ classeIdSouhaitee: e.target.value })}
          className="mt-2"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Veuillez contacter l'administration pour obtenir l'ID de la classe souhaitée
        </p>
      </div>

      <div>
        <h3 className="font-medium text-foreground mb-3">Activités sélectionnées</h3>
        <div className="space-y-2">
          {activities.map((activity) => (
            <label
              key={activity}
              className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.selectedActivities.includes(activity)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateFormData({
                      selectedActivities: [...formData.selectedActivities, activity],
                    })
                  } else {
                    updateFormData({
                      selectedActivities: formData.selectedActivities.filter((a: string) => a !== activity),
                    })
                  }
                }}
                className="w-4 h-4 rounded accent-secondary"
              />
              <span className="text-sm font-medium">{activity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
