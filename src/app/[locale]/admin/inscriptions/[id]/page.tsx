"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api"
import type { Locale } from "@/lib/i18n/config"

interface AdminInscriptionDetailProps {
  params: Promise<{ locale: Locale; id: string }>
}

export default function AdminInscriptionDetailPage({ params }: AdminInscriptionDetailProps) {
  const resolvedParams = use(params)
  const { id, locale } = resolvedParams
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inscription, setInscription] = useState<any | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchDetail() {
      try {
        setLoading(true)
        setError(null)
        const res = await apiClient.getAdminInscription(id)
        if (!cancelled) {
          setInscription(res.data)
        }
      } catch (err: any) {
        console.error("[Admin/InscriptionDetail] Error loading inscription", err)
        if (!cancelled) {
          setError("Impossible de charger le détail de l'inscription.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchDetail()

    return () => {
      cancelled = true
    }
  }, [id])

  const goBack = () => {
    router.push(`/${locale}/admin/inscriptions`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Chargement du détail de l'inscription…</p>
      </div>
    )
  }

  if (error || !inscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <p className="text-sm text-destructive">{error ?? "Inscription introuvable."}</p>
        <Button variant="outline" onClick={goBack}>
          ← Retour aux inscriptions
        </Button>
      </div>
    )
  }

  const statut = inscription.statut as string | undefined
  let badgeClass = "bg-gray-100 text-gray-700"
  if (statut === "ACTIF") badgeClass = "bg-green-100 text-green-700"
  else if (statut === "CANDIDATURE") badgeClass = "bg-yellow-100 text-yellow-700"
  else if (statut === "EN_COURS") badgeClass = "bg-blue-100 text-blue-700"
  else if (statut === "REJETEE") badgeClass = "bg-red-100 text-red-700"

  const enfant = inscription.payload?.enfant
  const parents = inscription.parents ?? []

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-10 md:py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Détail de l'inscription</h1>
            <p className="text-sm text-muted-foreground">ID: {inscription.id}</p>
          </div>
          <Button variant="outline" size="sm" onClick={goBack}>
            ← Retour
          </Button>
        </div>

        <Card className="p-6 border-2 border-border/50">
          <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {enfant ? `${enfant.prenom} ${enfant.nom}` : "Enfant"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Créée le {new Date(inscription.createdAt).toLocaleString(locale)}
              </p>
            </div>
            <Badge className={badgeClass}>{statut ?? "Inconnu"}</Badge>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Parents / Tuteurs</h3>
              {parents.length === 0 ? (
                <p className="text-muted-foreground text-xs">Aucun parent trouvé dans le dossier.</p>
              ) : (
                <ul className="space-y-2">
                  {parents.map((p: any, idx: number) => (
                    <li key={idx} className="flex justify-between gap-4">
                      <span className="font-medium">{p.nom}</span>
                      <span className="text-muted-foreground text-xs">{p.email}</span>
                      <span className="text-muted-foreground text-xs">{p.lien}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Notes administratives</h3>
              <p className="text-sm text-muted-foreground">
                {inscription.notes || "Aucune note pour le moment."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
