"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarNew } from "@/components/layout/sidebar-new"
import { apiClient } from "@/lib/api"
import type { Locale } from "@/lib/i18n/config"

interface TeachersPageProps {
  params: Promise<{ locale: Locale }>
}

interface TeacherItem {
  id: string
  fullName: string
  email: string
  role: string
  assignedClassId?: string | null
}

interface ClassItem {
  id: string
  nom: string
}

export default function TeachersPage({ params }: TeachersPageProps) {
  const resolvedParams = use(params)
  const currentLocale = resolvedParams.locale

  const [teachers, setTeachers] = useState<TeacherItem[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [newTeacher, setNewTeacher] = useState({
    prenom: "",
    nom: "",
    email: "",
    classeId: "",
  })

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const [usersRes, classesRes] = await Promise.all([
          apiClient.listUsers(),
          apiClient.listClasses(),
        ])

        const users = Array.isArray(usersRes.data?.items)
          ? usersRes.data.items
          : Array.isArray(usersRes.data)
          ? usersRes.data
          : []
        const teacherItems: TeacherItem[] = users
          .filter((u: any) => u.role === "TEACHER" || u.role === "ENSEIGNANT")
          .map((u: any) => ({
            id: u.id,
            fullName: `${u.prenom ?? ""} ${u.nom ?? ""}`.trim() || u.email,
            email: u.email,
            role: u.role,
            assignedClassId: u.classeId ?? null,
          }))

        const classItems: ClassItem[] = (classesRes.data ?? []).map((c: any) => ({
          id: c.id,
          nom: c.nom,
        }))

        if (!cancelled) {
          setTeachers(teacherItems)
          setClasses(classItems)
        }
      } catch (err) {
        console.error("[Admin/Teachers] Error loading teachers/classes", err)
        if (!cancelled) {
          setError("Impossible de charger les enseignants ou les classes.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [])

  const handleAssignClass = async (teacherId: string, classeId: string) => {
    try {
      if (!classeId) return
      await apiClient.assignTeacherToClass(classeId, teacherId)
      setTeachers((prev) =>
        prev.map((t) => (t.id === teacherId ? { ...t, assignedClassId: classeId } : t)),
      )
    } catch (err) {
      console.error("[Admin/Teachers] Error assigning teacher to class", err)
      alert("Erreur lors de l'assignation de l'enseignant à la classe.")
    }
  }

  const handleCreateTeacher = async () => {
    setCreateError(null)
    if (!newTeacher.email || !newTeacher.classeId) {
      setCreateError("Email et classe sont obligatoires.")
      return
    }

    try {
      setCreating(true)
      const res = await apiClient.createUser({
        prenom: newTeacher.prenom || undefined,
        nom: newTeacher.nom || undefined,
        email: newTeacher.email,
        role: "ENSEIGNANT",
      })

      const created = res.data

      // Récupérer l'id de l'utilisateur créé
      let teacherId: string | undefined = created?.id
      if (!teacherId) {
        // Fallback : recharger les utilisateurs et retrouver par email
        const usersRes = await apiClient.listUsers()
        const usersAll = Array.isArray(usersRes.data?.items)
          ? usersRes.data.items
          : Array.isArray(usersRes.data)
          ? usersRes.data
          : []
        const found = usersAll.find((u: any) => u.email === newTeacher.email)
        teacherId = found?.id
      }

      if (!teacherId) {
        console.warn(
          "[Admin/Teachers] Teacher appears created but id could not be resolved immediately. You may need to refresh or assign via the list.",
        )
        // On arrête ici sans afficher d'erreur bloquante ;
        // l'enseignant sera visible via la liste globale.
        setNewTeacher({ prenom: "", nom: "", email: "", classeId: "" })
        return
      }

      // Assigner immédiatement à la classe choisie
      await apiClient.assignTeacherToClass(newTeacher.classeId, teacherId)

      // Mettre à jour la liste locale
      setTeachers((prev) => [
        ...prev,
        {
          id: teacherId,
          fullName: `${created?.prenom ?? newTeacher.prenom ?? ""} ${
            created?.nom ?? newTeacher.nom ?? ""
          }`.trim() || created?.email || newTeacher.email,
          email: created?.email || newTeacher.email,
          role: created?.role || "ENSEIGNANT",
          assignedClassId: newTeacher.classeId,
        },
      ])

      // Reset du formulaire
      setNewTeacher({ prenom: "", nom: "", email: "", classeId: "" })
    } catch (err: any) {
      console.error("[Admin/Teachers] Error creating teacher", err)
      const apiMessage = err?.response?.data?.message
      if (typeof apiMessage === "string") {
        setCreateError(apiMessage)
      } else if (Array.isArray(apiMessage)) {
        setCreateError(apiMessage.join(" "))
      } else {
        setCreateError("Erreur lors de la création de l'enseignant. Veuillez vérifier les informations.")
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SidebarNew currentLocale={currentLocale} />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Enseignants & classes</h1>
            <p className="text-sm text-muted-foreground">
              Gérez les enseignants et assignez-les aux classes.
            </p>
          </div>
          <Link href={`/${currentLocale}/admin`}>
            <Button variant="outline">← Retour au dashboard</Button>
          </Link>
        </div>

        {error && (
          <p className="mb-4 text-sm text-destructive">{error}</p>
        )}

        {/* Create Teacher */}
        <div className="mb-8 p-4 border border-border/60 rounded-lg bg-white shadow-sm space-y-3">
          <h2 className="text-base md:text-lg font-semibold text-foreground">Ajouter un enseignant</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Créez un enseignant, assignez-le immédiatement à une classe. Un email d'invitation avec identifiants sera envoyé à l'adresse indiquée.
          </p>
          {createError && (
            <p className="text-xs text-destructive mb-1">{createError}</p>
          )}
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <input
              type="text"
              placeholder="Prénom"
              className="flex-1 border border-border rounded-md px-2 py-1 text-sm bg-background"
              value={newTeacher.prenom}
              onChange={(e) => setNewTeacher((prev) => ({ ...prev, prenom: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Nom"
              className="flex-1 border border-border rounded-md px-2 py-1 text-sm bg-background"
              value={newTeacher.nom}
              onChange={(e) => setNewTeacher((prev) => ({ ...prev, nom: e.target.value }))}
            />
            <input
              type="email"
              placeholder="Email de l'enseignant"
              className="flex-1 border border-border rounded-md px-2 py-1 text-sm bg-background"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher((prev) => ({ ...prev, email: e.target.value }))}
            />
            <select
              className="border border-border rounded-md px-2 py-1 text-sm bg-background min-w-[160px]"
              value={newTeacher.classeId}
              onChange={(e) => setNewTeacher((prev) => ({ ...prev, classeId: e.target.value }))}
            >
              <option value="">Classe...</option>
              {classes.map((classe) => (
                <option key={classe.id} value={classe.id}>
                  {classe.nom}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={handleCreateTeacher}
              disabled={creating}
              className="whitespace-nowrap"
            >
              {creating ? "Création..." : "Ajouter"}
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement des enseignants et des classes…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teachers list */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Enseignants</h2>
              {teachers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun enseignant trouvé.</p>
              ) : (
                <div className="space-y-3">
                  {teachers.map((teacher) => (
                    <Card key={teacher.id} className="p-4 border-2 border-border/50 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{teacher.fullName}</p>
                        <p className="text-xs text-muted-foreground">{teacher.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">Classe :</span>
                        <select
                          className="text-sm border border-border rounded-md px-2 py-1 bg-background"
                          value={teacher.assignedClassId ?? ""}
                          onChange={(e) => handleAssignClass(teacher.id, e.target.value)}
                        >
                          <option value="">Non assigné</option>
                          {classes.map((classe) => (
                            <option key={classe.id} value={classe.id}>
                              {classe.nom}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Classes list */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Classes</h2>
              {classes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune classe trouvée.</p>
              ) : (
                <div className="space-y-2">
                  {classes.map((classe) => (
                    <Card key={classe.id} className="p-3 border border-border/60 flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{classe.nom}</span>
                      <Badge className="bg-sky-50 text-sky-700 border border-sky-100 text-xs">Classe</Badge>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
