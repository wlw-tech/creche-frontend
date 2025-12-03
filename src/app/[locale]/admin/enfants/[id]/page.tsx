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
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-semibold mb-1">Informations principales</h2>
              <p className="text-sm">
                <span className="text-muted-foreground mr-2">Parent principal :</span>
                <span className="font-medium">{parentName}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground mr-2">Classe :</span>
                <span className="font-medium">{group}</span>
              </p>
            </Card>

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
