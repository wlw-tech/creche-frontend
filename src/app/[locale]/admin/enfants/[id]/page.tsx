"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Locale } from "@/lib/i18n/config";
import { apiClient } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarNew } from "@/components/layout/sidebar-new";

export default function EnfantDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  const t = useTranslations("admin.children");

  const [enfant, setEnfant] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchEnfant() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.getChild(id);
        if (!cancelled) {
          setEnfant(res.data);
        }
      } catch (err) {
        console.error("[Admin/Enfant detail] Error loading child", err);
        if (!cancelled) {
          setError("Impossible de charger la fiche enfant.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchEnfant();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarNew currentLocale={locale} />
        <div className="flex-1 ml-64 p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement de la fiche enfant…</p>
        </div>
      </div>
    );
  }

  if (error || !enfant) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarNew currentLocale={locale} />
        <div className="flex-1 ml-64 p-8 flex items-center justify-center">
          <p className="text-destructive text-sm">{error ?? "Fiche enfant introuvable."}</p>
        </div>
      </div>
    );
  }

  const fullName = `${enfant.prenom} ${enfant.nom}`.trim();
  const group = enfant.classe?.nom ?? "—";
  const tuteurs = enfant.famille?.tuteurs ?? [];
  const principal = tuteurs.find((t: any) => t.principal) ?? tuteurs[0];
  const parentName = principal
    ? `${principal.prenom ?? ""} ${principal.nom ?? ""}`.trim() || principal.telephone || "—"
    : "—";
  const birthdate = enfant.dateNaissance ? new Date(enfant.dateNaissance) : null;
  const allergies: string[] = Array.isArray(enfant.allergies) ? enfant.allergies : [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SidebarNew currentLocale={locale} />

      {/* Main content */}
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">{fullName}</h1>
              <p className="text-sm text-muted-foreground">Classe : {group}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => history.back()}
            >
              {t("backToList")}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Fiche enfant */}
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-semibold mb-1">Informations enfant</h2>
              <p className="text-sm">
                <span className="text-muted-foreground mr-2">Nom complet :</span>
                <span className="font-medium">{fullName}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground mr-2">Classe :</span>
                <span className="font-medium">{group}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground mr-2">Date de naissance :</span>
                <span className="font-medium">
                  {birthdate
                    ? birthdate.toLocaleDateString(locale)
                    : "—"}
                </span>
              </p>
            </Card>

            {/* Fiche santé simple */}
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-semibold mb-1">Fiche santé</h2>
              {allergies.length > 0 ? (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Allergies connues :</p>
                  <ul className="flex flex-wrap gap-2">
                    {allergies.map((a) => (
                      <li
                        key={a}
                        className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune allergie renseignée.</p>
              )}
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Parents / tuteurs */}
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-semibold mb-2">Parents / tuteurs</h2>
              {tuteurs && tuteurs.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {tuteurs.map((tut: any) => (
                    <li key={tut.id} className="border-b last:border-b-0 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {`${tut.prenom ?? ""} ${tut.nom ?? ""}`.trim() || tut.telephone || "—"}
                        </span>
                        {tut.principal && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-[11px]">
                            Responsable principal
                          </Badge>
                        )}
                      </div>
                      {tut.lien && (
                        <p className="text-xs text-muted-foreground">Lien : {tut.lien}</p>
                      )}
                      {tut.telephone && (
                        <p className="text-xs text-muted-foreground">Tel : {tut.telephone}</p>
                      )}
                      {tut.email && (
                        <p className="text-xs text-muted-foreground">Email : {tut.email}</p>
                      )}
                      {tut.adresse && (
                        <p className="text-xs text-muted-foreground">Adresse : {tut.adresse}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun tuteur renseigné.</p>
              )}
            </Card>

            {/* Présences récentes */}
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-semibold mb-1">Présences récentes</h2>
              {enfant.presences && enfant.presences.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {enfant.presences.map((p: any) => (
                    <li key={p.id} className="flex items-center justify-between">
                      <span>{new Date(p.date).toLocaleDateString(locale)}</span>
                      <Badge>{p.statut}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune présence enregistrée.</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
