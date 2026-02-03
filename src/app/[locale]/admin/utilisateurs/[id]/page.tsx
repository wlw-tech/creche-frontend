"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { apiClient } from "@/lib/api";
import type { Locale } from "@/lib/i18n/config";

type UserProfile = {
  id: string;
  email: string;
  telephone?: string | null;
  prenom: string;
  nom: string;
  langue?: string | null;
  role: string;
  statut: string;
  creeLe?: string | null;
  modifieLe?: string | null;
  tuteur?: {
    id: string;
    familleId: string;
    lien?: string | null;
    prenom?: string | null;
    nom?: string | null;
    telephone?: string | null;
    adresse?: string | null;
    email?: string | null;
    principal?: boolean | null;
    famille?: {
      id: string;
      emailPrincipal?: string | null;
      languePreferee?: string | null;
      adresseFacturation?: string | null;
      enfants?: Array<{
        id: string;
        prenom: string;
        nom: string;
        dateNaissance?: string | null;
        genre?: string | null;
        classeId?: string | null;
        profilSante?: {
          allergies?: Array<{
            id: string;
            nom: string;
            severite?: string | null;
            notes?: string | null;
          }>;
        } | null;
        classe?: {
          id: string;
          nom: string;
        } | null;
      }>;
      tuteurs?: Array<{
        id: string;
        lien?: string | null;
        prenom?: string | null;
        nom?: string | null;
        telephone?: string | null;
        adresse?: string | null;
        email?: string | null;
        principal?: boolean | null;
      }>;
    };
  };
};

export default function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolved = use(params);
  const currentLocale = resolved.locale;
  const userId = resolved.id;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.getAdminUser(userId);
        const payload = res.data;

        if (!cancelled) {
          setProfile(payload);
        }
      } catch (e) {
        console.error("[Admin/UserProfile] load error", e);
        if (!cancelled) setError("Impossible de charger le profil utilisateur.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString(currentLocale);
    } catch {
      return value;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNew currentLocale={currentLocale} />

      <div className="flex-1 ml-64 p-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profil utilisateur</h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Détails complets du compte et, si parent, de la famille et des enfants.
              </p>
            </div>
            <Link href="/admin/utilisateurs">
              <Button variant="outline">Retour</Button>
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : !profile ? (
            <p className="text-sm text-muted-foreground">Profil introuvable.</p>
          ) : (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Utilisateur</p>
                    <p className="text-xl font-semibold text-foreground">
                      {profile.prenom} {profile.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="uppercase">
                      {profile.role}
                    </Badge>
                    <Badge variant="outline" className="uppercase">
                      {profile.statut}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{profile.telephone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Créé le</p>
                    <p className="font-medium">{formatDate(profile.creeLe)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Modifié le</p>
                    <p className="font-medium">{formatDate(profile.modifieLe)}</p>
                  </div>
                </div>
              </Card>

              {profile.role === "PARENT" ? (
                <>
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Famille</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Email principal</p>
                        <p className="font-medium">{profile.tuteur?.famille?.emailPrincipal ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Adresse facturation</p>
                        <p className="font-medium">{profile.tuteur?.famille?.adresseFacturation ?? "—"}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-2">Tuteurs</h3>
                      {profile.tuteur?.famille?.tuteurs && profile.tuteur.famille.tuteurs.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted-foreground border-b">
                                <th className="py-2 pr-4">Nom</th>
                                <th className="py-2 pr-4">Lien</th>
                                <th className="py-2 pr-4">Email</th>
                                <th className="py-2 pr-4">Téléphone</th>
                                <th className="py-2 pr-4">Principal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {profile.tuteur.famille.tuteurs.map((t) => (
                                <tr key={t.id} className="border-b last:border-0">
                                  <td className="py-3 pr-4 font-medium">{`${t.prenom ?? ""} ${t.nom ?? ""}`.trim() || "—"}</td>
                                  <td className="py-3 pr-4 text-muted-foreground">{t.lien ?? "—"}</td>
                                  <td className="py-3 pr-4 text-muted-foreground">{t.email ?? "—"}</td>
                                  <td className="py-3 pr-4 text-muted-foreground">{t.telephone ?? "—"}</td>
                                  <td className="py-3 pr-4 text-muted-foreground">{t.principal ? "Oui" : "Non"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun tuteur.</p>
                      )}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Enfants</h2>
                    {profile.tuteur?.famille?.enfants && profile.tuteur.famille.enfants.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground border-b">
                              <th className="py-2 pr-4">Nom</th>
                              <th className="py-2 pr-4">Naissance</th>
                              <th className="py-2 pr-4">Genre</th>
                              <th className="py-2 pr-4">Classe</th>
                              <th className="py-2 pr-4">Allergies</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profile.tuteur.famille.enfants.map((e) => (
                              <tr key={e.id} className="border-b last:border-0">
                                <td className="py-3 pr-4 font-medium">{e.prenom} {e.nom}</td>
                                <td className="py-3 pr-4 text-muted-foreground">{e.dateNaissance ? new Date(e.dateNaissance).toLocaleDateString(currentLocale) : "—"}</td>
                                <td className="py-3 pr-4 text-muted-foreground">{e.genre ?? "—"}</td>
                                <td className="py-3 pr-4 text-muted-foreground">{e.classe?.nom ?? "Non affecté"}</td>
                                <td className="py-3 pr-4 text-muted-foreground">
                                  {e.profilSante?.allergies && e.profilSante.allergies.length > 0
                                    ? e.profilSante.allergies.map((a) => a.nom).join(", ")
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucun enfant.</p>
                    )}
                  </Card>
                </>
              ) : (
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground">
                    Ce profil n'est pas un parent. Aucun détail famille/enfants à afficher.
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
