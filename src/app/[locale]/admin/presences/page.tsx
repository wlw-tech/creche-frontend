"use client"

import { use, useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarNew } from "@/components/layout/sidebar-new"
import { apiClient } from "@/lib/api"
import type { Locale } from "@/lib/i18n/config"

type PresenceRow = {
  id: string
  date: string
  statut: "Present" | "Absent" | "Justifie"
  enfant?: {
    id: string
    prenom?: string
    nom?: string
    classe?: {
      id: string
      nom: string
    }
  }
  arriveeA?: string
  departA?: string
  enregistrePar?: {
    id: string
    prenom: string
    nom: string
  }
}

type ClasseItem = {
  id: string
  nom: string
}

type TeacherItem = {
  id: string
  prenom: string
  nom: string
  email?: string
}

export default function AdminPresencesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const resolvedParams = use(params)
  const currentLocale = resolvedParams.locale

  const [dateMin, setDateMin] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [dateMax, setDateMax] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [classeId, setClasseId] = useState<string>("")
  const [enregistreParId, setEnregistreParId] = useState<string>("")
  const [statut, setStatut] = useState<string>("")
  const [q, setQ] = useState<string>("")
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(25)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<PresenceRow[]>([])

  const [classes, setClasses] = useState<ClasseItem[]>([])
  const [teachers, setTeachers] = useState<TeacherItem[]>([])
  const [total, setTotal] = useState<number>(0)

  const totalPages = useMemo(() => {
    if (!total || total <= 0) return 1
    return Math.max(1, Math.ceil(total / pageSize))
  }, [total, pageSize])

  useEffect(() => {
    let cancelled = false

    async function loadFiltersData() {
      try {
        const [classesRes, teachersRes] = await Promise.all([
          apiClient.listClasses(),
          apiClient.listUsers({ role: "ENSEIGNANT", limit: 200 }),
        ])

        const classesPayload = classesRes.data
        const cls: ClasseItem[] = Array.isArray(classesPayload?.data)
          ? classesPayload.data
          : Array.isArray(classesPayload)
            ? classesPayload
            : []

        const teachersPayload = teachersRes.data
        const teacherRows: any[] = Array.isArray(teachersPayload?.data)
          ? teachersPayload.data
          : Array.isArray(teachersPayload?.items)
            ? teachersPayload.items
            : Array.isArray(teachersPayload)
              ? teachersPayload
              : []

        const mappedTeachers: TeacherItem[] = teacherRows
          .filter((u: any) => u?.id)
          .map((u: any) => ({
            id: u.id,
            prenom: u.prenom,
            nom: u.nom,
            email: u.email,
          }))

        if (!cancelled) {
          setClasses(cls)
          setTeachers(mappedTeachers)
        }
      } catch (e) {
        console.error("[Admin/Presences] loadFiltersData error", e)
      }
    }

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const res = await apiClient.listPresences({
          dateMin: dateMin || undefined,
          dateMax: dateMax || undefined,
          classeId: classeId || undefined,
          enregistreParId: enregistreParId || undefined,
          statut: statut || undefined,
          q: q || undefined,
          page,
          pageSize,
        })

        const payload = res.data
        const rows: PresenceRow[] = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : []

        const totalCount: number =
          typeof payload?.total === "number"
            ? payload.total
            : Array.isArray(rows)
              ? rows.length
              : 0

        if (!cancelled) {
          setItems(rows)
          setTotal(totalCount)
        }
      } catch (e) {
        console.error("[Admin/Presences] load error", e)
        if (!cancelled) setError("Impossible de charger l'historique des présences.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadFiltersData()
    void load()
    return () => {
      cancelled = true
    }
  }, [dateMin, dateMax, classeId, enregistreParId, statut, q, page, pageSize])

  const badgeClass = (statut: PresenceRow["statut"]) => {
    if (statut === "Present") return "bg-green-100 text-green-700"
    if (statut === "Absent") return "bg-red-100 text-red-700"
    if (statut === "Justifie") return "bg-blue-100 text-blue-700"
    return "bg-gray-100 text-gray-700"
  }

  const fetchAllMatching = async (): Promise<PresenceRow[]> => {
    const all: PresenceRow[] = []
    let currentPage = 1
    const maxPageSize = 200
    let hasNext = true

    while (hasNext) {
      const res = await apiClient.listPresences({
        dateMin: dateMin || undefined,
        dateMax: dateMax || undefined,
        classeId: classeId || undefined,
        enregistreParId: enregistreParId || undefined,
        statut: statut || undefined,
        q: q || undefined,
        page: currentPage,
        pageSize: maxPageSize,
      })

      const payload = res.data
      const rows: PresenceRow[] = Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : []

      all.push(...rows)

      const serverHasNext = Boolean(payload?.hasNext)
      if (!serverHasNext || rows.length < maxPageSize) {
        hasNext = false
      } else {
        currentPage += 1
      }
    }

    return all
  }

  const exportCsv = async () => {
    const exportRows = await fetchAllMatching()
    const header = ["Date", "Enfant", "Classe", "Statut", "Arrivee", "Enseignant"].join(",")
    const rows = exportRows.map((row) => {
      const enfant = row.enfant ? `${row.enfant.prenom ?? ""} ${row.enfant.nom ?? ""}`.trim() : ""
      const classe = row.enfant?.classe?.nom ?? ""
      const teacher = row.enregistrePar
        ? `${row.enregistrePar.prenom ?? ""} ${row.enregistrePar.nom ?? ""}`.trim()
        : ""
      const cols = [
        row.date ?? "",
        enfant,
        classe,
        row.statut ?? "",
        row.arriveeA ?? "",
        teacher,
      ].map((c) => `"${String(c).replaceAll('"', '""')}"`)
      return cols.join(",")
    })

    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `presences_${dateMin || ""}_${dateMax || ""}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const printTable = async () => {
    const exportRows = await fetchAllMatching()
    const htmlRows = exportRows
      .map((row) => {
        const enfant = row.enfant
          ? `${row.enfant.prenom ?? ""} ${row.enfant.nom ?? ""}`.trim() || "—"
          : "—"
        const classe = row.enfant?.classe?.nom ?? "—"
        const teacher = row.enregistrePar
          ? `${row.enregistrePar.prenom ?? ""} ${row.enregistrePar.nom ?? ""}`.trim() || "—"
          : "—"
        return `
          <tr>
            <td>${row.date ?? "—"}</td>
            <td>${enfant}</td>
            <td>${classe}</td>
            <td>${row.statut ?? "—"}</td>
            <td>${row.arriveeA ?? "—"}</td>
            <td>${teacher}</td>
          </tr>
        `
      })
      .join("")

    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(`
      <html>
        <head>
          <title>Historique de présence</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 18px; margin: 0 0 12px; }
            .meta { font-size: 12px; color: #444; margin: 0 0 16px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
            th { background: #f5f5f5; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Historique de présence</h1>
          <div class="meta">Période: ${dateMin || "—"} → ${dateMax || "—"}</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Enfant</th>
                <th>Classe</th>
                <th>Statut</th>
                <th>Arrivée</th>
                <th>Enseignant</th>
              </tr>
            </thead>
            <tbody>
              ${htmlRows}
            </tbody>
          </table>
        </body>
      </html>
    `)
    w.document.close()
    w.focus()
    w.print()
    w.close()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNew currentLocale={currentLocale} />

      <div className="flex-1 ml-64 p-8">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Historique de présence</h1>
              <p className="text-muted-foreground text-sm">
                Affichage des présences du jour sélectionné, avec l'enseignant qui a enregistré.
              </p>
            </div>
          </div>

          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Date min</p>
                <Input type="date" value={dateMin} onChange={(e) => { setPage(1); setDateMin(e.target.value) }} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Date max</p>
                <Input type="date" value={dateMax} onChange={(e) => { setPage(1); setDateMax(e.target.value) }} />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Classe</p>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={classeId}
                  onChange={(e) => { setPage(1); setClasseId(e.target.value) }}
                >
                  <option value="">Toutes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Enseignant</p>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={enregistreParId}
                  onChange={(e) => { setPage(1); setEnregistreParId(e.target.value) }}
                >
                  <option value="">Tous</option>
                  {teachers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {`${u.prenom} ${u.nom}`.trim()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Statut</p>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={statut}
                  onChange={(e) => { setPage(1); setStatut(e.target.value) }}
                >
                  <option value="">Tous</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Justifie">Justifie</option>
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Recherche enfant</p>
                <Input
                  value={q}
                  onChange={(e) => { setPage(1); setQ(e.target.value) }}
                  placeholder="Nom / prénom"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10)
                    setPage(1)
                    setDateMin(today)
                    setDateMax(today)
                  }}
                >
                  Aujourd'hui
                </Button>
                <Button variant="outline" onClick={exportCsv}>
                  Export CSV
                </Button>
                <Button variant="outline" onClick={printTable}>
                  Imprimer
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Par page</span>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={String(pageSize)}
                  onChange={(e) => {
                    setPage(1)
                    setPageSize(Number(e.target.value))
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </Card>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune présence trouvée pour cette période.</p>
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground">
                  Total: {total} • Page {page}/{totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Suivant
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Enfant</th>
                      <th className="py-2 pr-4">Classe</th>
                      <th className="py-2 pr-4">Statut</th>
                      <th className="py-2 pr-4">Arrivée</th>
                      <th className="py-2 pr-4">Enseignant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => {
                      const teacher = row.enregistrePar
                        ? `${row.enregistrePar.prenom ?? ""} ${row.enregistrePar.nom ?? ""}`.trim() || "—"
                        : "—"
                      return (
                        <tr key={row.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 text-muted-foreground">{row.date ?? "—"}</td>
                          <td className="py-3 pr-4 font-medium">
                            {row.enfant
                              ? `${row.enfant.prenom ?? ""} ${row.enfant.nom ?? ""}`.trim() || "—"
                              : "—"}
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{row.enfant?.classe?.nom ?? "—"}</td>
                          <td className="py-3 pr-4">
                            <Badge className={badgeClass(row.statut)}>{row.statut}</Badge>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{row.arriveeA ?? "—"}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{teacher}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
