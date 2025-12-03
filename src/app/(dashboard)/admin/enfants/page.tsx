"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye } from "lucide-react";
import { apiClient } from "@/lib/api";

type EnfantItem = {
  id: string;
  prenom: string;
  nom: string;
  classe?: { nom: string | null };
  famille?: {
    tuteurs: { prenom: string | null; nom: string | null; telephone?: string | null; principal?: boolean }[];
  };
};

export default function EnfantsPage() {
  const [search, setSearch] = useState("");
  const [children, setChildren] = useState<EnfantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchChildren() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.listChildren(1, 200);
        // selon ton controller Nest, ça peut être { items: [...], total: ... } ou juste [...]
        const items = Array.isArray(res.data) ? res.data : res.data.items ?? res.data.data ?? [];

        if (!cancelled) {
          setChildren(items);
        }
      } catch (err) {
        console.error("Error loading children", err);
        if (!cancelled) {
          setError("Impossible de charger la liste des enfants.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchChildren();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = children.filter((child) =>
    `${child.prenom} ${child.nom}`.toLowerCase().includes(search.toLowerCase())
  );

  const total = children.length;

  const formatParent = (enfant: EnfantItem) => {
    const principal =
      enfant.famille?.tuteurs?.find((t) => t.principal) ??
      enfant.famille?.tuteurs?.[0];

    if (!principal) return "—";

    const name = `${principal.prenom ?? ""} ${principal.nom ?? ""}`.trim();
    const tel = principal.telephone ? `• ${principal.telephone}` : "";
    return `${name} ${tel}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tous les enfants</h1>
        <p className="text-muted-foreground">
          {loading ? "Chargement..." : `${total} enfant${total > 1 ? "s" : ""}`}
        </p>
      </div>

      <Card className="p-6">
        {/* Filtres */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Filtrer
          </Button>
        </div>

        {/* Erreur */}
        {error && (
          <p className="text-sm text-red-500 mb-4">
            {error}
          </p>
        )}

        {/* Loading */}
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">
            Chargement des enfants...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Nom</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Groupe</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Parent principal</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((child) => (
                  <tr key={child.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-3 font-medium">
                      {child.prenom} {child.nom}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {child.classe?.nom ?? "Non assigné"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground text-xs">
                      {formatParent(child)}
                    </td>
                    <td className="px-6 py-3">
                      <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                        <Eye className="w-4 h-4" />
                        Voir profil
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center text-muted-foreground">
                      Aucun enfant ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
