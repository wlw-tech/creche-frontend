"use client"

import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step1Props {
  formData: any
  updateFormData: (data: any) => void
  classes?: { id: string; nom: string }[]
}

export default function Step1ChildInfo({ formData, updateFormData, classes }: Step1Props) {
  const activities = ["Garderie de 16h45 à 18h", "Atelier du mercredi"]
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type and size (max 5MB, JPEG/PNG/WEBP only)
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) {
      alert("Format non supporté. Utilisez JPEG, PNG ou WEBP.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("La photo ne doit pas dépasser 5 Mo.")
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      updateFormData({ childPhotoBase64: ev.target?.result as string, childPhotoFile: file.name })
    }
    reader.readAsDataURL(file)
  }

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
            Prénom de l'enfant <span className="text-red-500">*</span>
          </Label>
          <Input
            id="childFirstName"
            placeholder="Ex: Mohammed Amine"
            value={formData.childFirstName}
            onChange={(e) => updateFormData({ childFirstName: e.target.value })}
            className="mt-2"
            required
          />
        </div>
        <div>
          <Label htmlFor="childLastName" className="text-sm font-medium">
            Nom de l'enfant <span className="text-red-500">*</span>
          </Label>
          <Input
            id="childLastName"
            placeholder="Ex: Bennani"
            value={formData.childLastName}
            onChange={(e) => updateFormData({ childLastName: e.target.value })}
            className="mt-2"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="dateOfBirth" className="text-sm font-medium">
            Date de naissance <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            className="mt-2"
            required
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

      {/* Photo de l'enfant */}
      <div>
        <Label className="text-sm font-medium">Photo de l'enfant</Label>
        <div className="mt-2 flex items-start gap-4">
          <div
            className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary/50 transition-colors flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.childPhotoBase64 ? (
              <img
                src={formData.childPhotoBase64}
                alt="Photo enfant"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-2">
                <svg className="w-8 h-8 text-muted-foreground mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-muted-foreground">Ajouter</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-primary hover:underline font-medium"
            >
              {formData.childPhotoBase64 ? "Changer la photo" : "Choisir une photo"}
            </button>
            <p className="text-xs text-muted-foreground mt-1">
              Format JPEG, PNG ou WEBP. Max 5 Mo. La photo sera visible dans les espaces parent et enseignant.
            </p>
            {formData.childPhotoFile && (
              <p className="text-xs text-green-600 mt-1">✓ {formData.childPhotoFile}</p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="classeIdSouhaitee" className="text-sm font-medium">
          Classe souhaitée <span className="text-red-500">*</span>
        </Label>
        <select
          id="classeIdSouhaitee"
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={formData.classeIdSouhaitee}
          onChange={(e) => updateFormData({ classeIdSouhaitee: e.target.value })}
          required
        >
          <option value="" disabled>
            Choisir une classe
          </option>
          {classes && classes.length > 0 ? (
            classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nom}
              </option>
            ))
          ) : (
            <>
              <option value="TPS">TPS — Toute Petite Section (18 mois – 2 ans)</option>
              <option value="PS">PS — Petite Section (2 – 3 ans)</option>
              <option value="MS">MS — Moyenne Section (3 – 4 ans)</option>
              <option value="GS">GS — Grande Section (4 – 5 ans)</option>
            </>
          )}
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Sélectionnez la classe appropriée pour l'enfant
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
