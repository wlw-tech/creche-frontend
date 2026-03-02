"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"

interface Step5Props {
  formData: any
  updateFormData: (data: any) => void
}

function renderMarkdown(text: string): string {
  // Simple markdown rendering for ##, **bold**, and line breaks
  return text
    .replace(/^## (.+)$/gm, '<h3 class="font-semibold text-foreground mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed mb-2">')
    .replace(/\n/g, '<br />')
}

export default function Step5Regulations({ formData, updateFormData }: Step5Props) {
  const [reglement, setReglement] = useState<{ contenu: string; version: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchReglement() {
      try {
        const res = await apiClient.getPublicReglement()
        if (!cancelled) setReglement(res.data)
      } catch {
        // Use default content if fetch fails
        if (!cancelled) setReglement(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchReglement()
    return () => { cancelled = true }
  }, [])

  const defaultContent = `## PetitsPas - Crèche Maternelle

PetitsPas est une crèche maternelle qui accueille les enfants de la Pouponnière à la Moyenne-section. Les petits y trouveront un accueil bienveillant et chaleureux, entourés par des adultes passionnés et dévoués.

## Les horaires de l'école

Horaires des classes : 8h30 à 11h30 et de 14h à 16h15, du lundi au vendredi. Un service de garde gratuit est assuré à partir de 7h45 le matin et jusqu'à 16h45 le soir.

## La scolarité

Les frais de scolarité sont à régler par trimestre. Toute absence (même prévisible) durant les périodes scolaires ne pourra faire l'objet de réduction sur les frais de scolarité mensuels.

## Vaccination & Maladie

Chaque enfant doit être à jour de ses vaccinations. Un enfant fiévreux ou nauséeux ne peut être accepté à l'école.

## Sécurité

Je reconnais avoir pris connaissance du règlement intérieur et m'engage à le respecter sans réserve.`

  const content = reglement?.contenu ?? defaultContent

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-1">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Règlement intérieur
        </h2>
        <p className="text-sm text-muted-foreground">Veuillez lire et accepter le règlement intérieur</p>
        {reglement?.version && (
          <p className="text-xs text-muted-foreground mt-0.5">Version {reglement.version}</p>
        )}
      </div>

      {/* Regulations Content */}
      <div className="bg-muted/30 border border-border rounded-lg p-6 max-h-96 overflow-y-auto text-sm">
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Chargement du règlement…</p>
        ) : (
          <div
            className="space-y-2 text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(content),
            }}
          />
        )}
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-border bg-background hover:border-primary/50 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={formData.regulationsAccepted}
            onChange={(e) => updateFormData({ regulationsAccepted: e.target.checked })}
            className="w-5 h-5 rounded mt-0.5 accent-secondary flex-shrink-0"
          />
          <span className="text-sm font-medium text-foreground leading-relaxed">
            Je reconnais avoir lu et accepté le règlement intérieur de PetitsPas et m'engage à le respecter sans réserve.{" "}
            <span className="text-red-500">*</span>
          </span>
        </label>

        <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-border bg-background hover:border-primary/50 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={formData.confirmationExacte ?? false}
            onChange={(e) => updateFormData({ confirmationExacte: e.target.checked })}
            className="w-5 h-5 rounded mt-0.5 accent-secondary flex-shrink-0"
          />
          <span className="text-sm font-medium text-foreground leading-relaxed">
            Je confirme que toutes les informations renseignées dans ce formulaire sont exactes et complètes.{" "}
            <span className="text-red-500">*</span>
          </span>
        </label>
      </div>
    </div>
  )
}
