"use client"

import { use, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarNew } from "@/components/layout/sidebar-new"
import { apiClient } from "@/lib/api"
import { Locale } from "@/lib/i18n/config"

export default function ReglementInterieurAdminPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = use(params)
  const [contenu, setContenu] = useState("")
  const [version, setVersion] = useState<number | null>(null)
  const [modifieLe, setModifieLe] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await apiClient.getAdminReglement()
        if (!cancelled) {
          setContenu(res.data?.contenu ?? "")
          setVersion(res.data?.version ?? null)
          setModifieLe(res.data?.modifieLe ?? null)
        }
      } catch {
        if (!cancelled) setErrorMsg("Impossible de charger le règlement intérieur.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    if (!contenu.trim()) {
      setErrorMsg("Le contenu ne peut pas être vide.")
      return
    }
    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await apiClient.updateAdminReglement(contenu)
      setVersion(res.data?.version ?? version)
      setModifieLe(res.data?.modifieLe ?? null)
      setSuccessMsg("Règlement intérieur mis à jour avec succès.")
    } catch {
      setErrorMsg("Erreur lors de la mise à jour. Veuillez réessayer.")
    } finally {
      setSaving(false)
    }
  }

  function renderMarkdown(text: string) {
    return text
      .replace(/^## (.+)$/gm, '<h3 class="font-semibold text-foreground mt-4 mb-2 text-base">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed mb-2">')
      .replace(/\n/g, '<br />')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNew currentLocale={locale} />

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Règlement Intérieur</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Modifiez le règlement intérieur affiché aux parents lors de l'inscription.
              </p>
              {version && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Version {version}
                  {modifieLe && ` · Modifié le ${new Date(modifieLe).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPreview(!preview)}
                className="text-sm"
              >
                {preview ? "Éditer" : "Aperçu"}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground text-sm"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </div>

          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
              {errorMsg}
            </div>
          )}

          <Card className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-muted-foreground text-sm">Chargement…</p>
              </div>
            ) : preview ? (
              /* Preview mode */
              <div className="min-h-64">
                <p className="text-xs text-muted-foreground mb-4 italic">Aperçu du règlement tel qu'il apparaît aux parents</p>
                <div
                  className="text-sm text-muted-foreground leading-relaxed space-y-1"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(contenu) }}
                />
              </div>
            ) : (
              /* Edit mode */
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Label className="text-sm font-medium">Contenu (Markdown supporté)</Label>
                  <span className="text-xs text-muted-foreground">
                    Utilisez ## pour les titres, **texte** pour le gras
                  </span>
                </div>
                <textarea
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  rows={20}
                  className="w-full p-4 border border-border rounded-lg font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                  placeholder="## Titre de section&#10;&#10;Contenu du règlement..."
                />
                <p className="text-xs text-muted-foreground">
                  Ce contenu sera affiché à tous les parents lors de leur inscription. Chaque modification incrémente la version.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={className}>{children}</label>
}
