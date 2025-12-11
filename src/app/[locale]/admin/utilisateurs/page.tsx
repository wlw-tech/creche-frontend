"use client";

import { use, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { Locale } from "@/lib/i18n/config";

type UserItem = {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: "ADMIN" | "ENSEIGNANT" | "PARENT" | string;
  statut: "INVITED" | "ACTIVE" | "DISABLED" | string;
  dernierAcces?: string | null;
};

export default function UtilisateursPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const currentLocale = resolvedParams.locale;

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [creatingError, setCreatingError] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("");
  const [createForm, setCreateForm] = useState({
    email: "",
    prenom: "",
    nom: "",
    role: "ENSEIGNANT" as "ENSEIGNANT" | "PARENT",
    telephone: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.listUsers();
        const items: UserItem[] = res.data.data ?? [];

        if (!cancelled) {
          setUsers(items);
        }
      } catch (err) {
        console.error("[Users] Error loading users", err);
        if (!cancelled) {
          setError("Impossible de charger les utilisateurs.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!selectedRoleFilter) return true;
    return u.role === selectedRoleFilter;
  });

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setCreatingError(null);

    try {
      const payload = {
        email: createForm.email,
        prenom: createForm.prenom,
        nom: createForm.nom,
        role: createForm.role,
        telephone: createForm.telephone || undefined,
      };
      await apiClient.createUser(payload);
      const res = await apiClient.listUsers();
      const items: UserItem[] = res.data.data ?? [];
      setUsers(items);
      setCreateForm({ email: "", prenom: "", nom: "", role: "ENSEIGNANT", telephone: "" });
    } catch (err) {
      console.error("[Users] Error creating user", err);
      setCreatingError("Erreur lors de la création de l'utilisateur.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeStatus = async (id: string, statut: "INVITED" | "ACTIVE" | "DISABLED") => {
    try {
      await apiClient.updateUserStatus(id, statut);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, statut } : u)),
      );
    } catch (err) {
      console.error("[Users] Error updating status", err);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      await apiClient.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("[Users] Error deleting user", err);
      alert("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNew currentLocale={currentLocale} />

      <div className="flex-1 ml-64 p-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tous les utilisateurs</h1>
              <p className="text-muted-foreground mt-2">
                {loading ? "Chargement..." : `${users.length} utilisateur(s)`}
              </p>
            </div>

            <Button onClick={() => setShowForm((prev) => !prev)} className="bg-primary">
              {showForm ? "Fermer" : "Nouvel utilisateur"}
            </Button>
          </div>

          {/* Formulaire création */}
          {showForm && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Créer un utilisateur</h2>
              {creatingError && (
                <p className="text-sm text-destructive mb-3">{creatingError}</p>
              )}
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prénom</label>
                    <Input
                      name="prenom"
                      value={createForm.prenom}
                      onChange={handleCreateChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <Input
                      name="nom"
                      value={createForm.nom}
                      onChange={handleCreateChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={createForm.email}
                      onChange={handleCreateChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rôle</label>
                    <select
                      name="role"
                      value={createForm.role}
                      onChange={handleCreateChange}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="ENSEIGNANT">Enseignant</option>
                      <option value="PARENT">Parent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone (optionnel)</label>
                  <Input
                    name="telephone"
                    value={createForm.telephone}
                    onChange={handleCreateChange}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="bg-primary" disabled={submitting}>
                    Inviter
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setCreatingError(null);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Card className="p-6">
            {error && <p className="text-sm text-destructive mb-4">{error}</p>}

            <div className="flex justify-end mb-4 gap-2">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="border rounded-md px-2 py-1 text-xs bg-background"
              >
                <option value="">Tous les rôles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="ENSEIGNANT">ENSEIGNANT</option>
                <option value="PARENT">PARENT</option>
              </select>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground py-12">
                Chargement des utilisateurs...
              </p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                Aucun utilisateur trouvé.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Nom</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Email</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Rôle</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Statut</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Dernier accès</th>
                      <th className="px-6 py-3 text-left font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border hover:bg-muted/40">
                        <td className="px-6 py-3 font-medium">
                          {u.prenom} {u.nom}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-6 py-3">
                          <Badge variant="outline" className="uppercase">
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-3">
                          <select
                            value={u.statut}
                            onChange={(e) =>
                              handleChangeStatus(
                                u.id,
                                e.target.value as "INVITED" | "ACTIVE" | "DISABLED",
                              )
                            }
                            className="border rounded-md px-2 py-1 text-xs"
                          >
                            <option value="INVITED">INVITED</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DISABLED">DISABLED</option>
                          </select>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground text-xs">
                          {u.dernierAcces
                            ? new Date(u.dernierAcces).toLocaleString(currentLocale)
                            : "—"}
                        </td>
                        <td className="px-6 py-3 text-xs">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-500 hover:bg-red-50"
                            onClick={() => handleDelete(u.id)}
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
