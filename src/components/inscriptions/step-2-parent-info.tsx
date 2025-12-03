"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step2Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step2ParentInfo({ formData, updateFormData }: Step2Props) {
  const familySituations = ["Mariés", "Divorcés", "Séparés"]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-1">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
          Informations des parents
        </h2>
        <p className="text-sm text-muted-foreground">Coordonnées des parents</p>
      </div>

      {/* Mother Info */}
      <div className="space-y-4 pb-6 border-b border-border">
        <h3 className="font-medium text-foreground">Informations de la mère</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="motherFirstName" className="text-sm font-medium">
              Prénom
            </Label>
            <Input
              id="motherFirstName"
              placeholder="Ex: Amina"
              value={formData.motherFirstName}
              onChange={(e) => updateFormData({ motherFirstName: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="motherLastName" className="text-sm font-medium">
              Nom
            </Label>
            <Input
              id="motherLastName"
              placeholder="Ex: Tazi"
              value={formData.motherLastName}
              onChange={(e) => updateFormData({ motherLastName: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="motherPhone" className="text-sm font-medium">
              Téléphone
            </Label>
            <Input
              id="motherPhone"
              placeholder="Ex: 0612345678"
              value={formData.motherPhone}
              onChange={(e) => updateFormData({ motherPhone: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="motherEmail" className="text-sm font-medium">
              E-mail
            </Label>
            <Input
              id="motherEmail"
              type="email"
              placeholder="Ex: amina@email.com"
              value={formData.motherEmail}
              onChange={(e) => updateFormData({ motherEmail: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="motherAddress" className="text-sm font-medium">
            Adresse
          </Label>
          <Input
            id="motherAddress"
            placeholder="Ex: 123 Rue de la Paix"
            value={formData.motherAddress}
            onChange={(e) => updateFormData({ motherAddress: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="motherProfession" className="text-sm font-medium">
            Profession
          </Label>
          <Input
            id="motherProfession"
            placeholder="Ex: Médecin"
            value={formData.motherProfession}
            onChange={(e) => updateFormData({ motherProfession: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>

      {/* Father Info */}
      <div className="space-y-4 pb-6 border-b border-border">
        <h3 className="font-medium text-foreground">Informations du père</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fatherFirstName" className="text-sm font-medium">
              Prénom
            </Label>
            <Input
              id="fatherFirstName"
              placeholder="Ex: Ahmed"
              value={formData.fatherFirstName}
              onChange={(e) => updateFormData({ fatherFirstName: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="fatherLastName" className="text-sm font-medium">
              Nom
            </Label>
            <Input
              id="fatherLastName"
              placeholder="Ex: Tazi"
              value={formData.fatherLastName}
              onChange={(e) => updateFormData({ fatherLastName: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fatherPhone" className="text-sm font-medium">
              Téléphone
            </Label>
            <Input
              id="fatherPhone"
              placeholder="Ex: 0623456789"
              value={formData.fatherPhone}
              onChange={(e) => updateFormData({ fatherPhone: e.target.value })}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="fatherEmail" className="text-sm font-medium">
              E-mail
            </Label>
            <Input
              id="fatherEmail"
              type="email"
              placeholder="Ex: ahmed@email.com"
              value={formData.fatherEmail}
              onChange={(e) => updateFormData({ fatherEmail: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="fatherAddress" className="text-sm font-medium">
            Adresse
          </Label>
          <Input
            id="fatherAddress"
            placeholder="Ex: 123 Rue de la Paix"
            value={formData.fatherAddress}
            onChange={(e) => updateFormData({ fatherAddress: e.target.value })}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="fatherProfession" className="text-sm font-medium">
            Profession
          </Label>
          <Input
            id="fatherProfession"
            placeholder="Ex: Avocat"
            value={formData.fatherProfession}
            onChange={(e) => updateFormData({ fatherProfession: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>

      {/* Family Situation */}
      <div>
        <Label className="text-sm font-medium">Situation familiale</Label>
        <div className="space-y-2 mt-3">
          {familySituations.map((situation) => (
            <label
              key={situation}
              className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border cursor-pointer hover:border-primary/50 transition-colors"
            >
              <input
                type="radio"
                name="familySituation"
                value={situation}
                checked={formData.familySituation === situation}
                onChange={(e) => updateFormData({ familySituation: e.target.value })}
                className="w-4 h-4 accent-secondary"
              />
              <span className="text-sm font-medium">{situation}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
