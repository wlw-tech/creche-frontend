"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";

type UserItem = {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: "ADMIN" | "ENSEIGNANT" | "PARENT" | string;
  statut: "INVITED" | "ACTIVE" | "DISABLED" | string;
  dernierAcces?: string | null;
};

export default function UtilisateursPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.listUsers();
        // Backend: { data: [...], pagination: {...} }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tous les utilisateurs</h1>
        <p className="text-muted-foreground mt-2">
          {loading ? "Chargement..." : `${users.length} utilisateur(s)`}
        </p>
      </div>

      <Card className="p-6">
        {/* Erreur */}
        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        {/* States */}
        {loading ? (
          <p className="text-center text-muted-foreground py-12">
            Chargement des utilisateurs...
          </p>
        ) : users.length === 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
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
                      <Badge
                        className={
                          u.statut === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : u.statut === "INVITED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {u.statut}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground text-xs">
                      {u.dernierAcces
                        ? new Date(u.dernierAcces).toLocaleString("fr-FR")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
