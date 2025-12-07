"use client";

import { useState, useEffect, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Locale } from "@/lib/i18n/config";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { apiClient } from "@/lib/api";

type InscriptionItem = {
  id: string;
  childName: string;
  parentName: string;
  email: string;
  status: string;
  statutCode: "CANDIDATURE" | "EN_COURS" | "ACTIF" | "REJETEE" | null;
  createdAt: string;
};

export default function InscriptionsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const currentLocale = resolvedParams.locale;
  const t = useTranslations("admin.inscriptions");
  const [search, setSearch] = useState("");
  const [inscriptions, setInscriptions] = useState<InscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    try {
      await apiClient.acceptAdminInscription(id);
      setInscriptions((prev) =>
        prev.map((insc) =>
          insc.id === id
            ? { ...insc, statutCode: 'ACTIF', status: 'Accepté' }
            : insc,
        ),
      );
    } catch (err) {
      console.error('[Admin/Inscriptions] Error accepting inscription', err);
      alert("Erreur lors de l'acceptation de l'inscription.");
    }
  };

  const handleReject = async (id: string) => {
    const raison = prompt('Raison du rejet (optionnelle) :') ?? undefined;
    try {
      await apiClient.rejectAdminInscription(id, raison);
      setInscriptions((prev) =>
        prev.map((insc) =>
          insc.id === id
            ? { ...insc, statutCode: 'REJETEE', status: 'Refusé' }
            : insc,
        ),
      );
    } catch (err) {
      console.error('[Admin/Inscriptions] Error rejecting inscription', err);
      alert("Erreur lors du rejet de l'inscription.");
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchInscriptions() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.listAdminInscriptions();
        const items = res.data?.items ?? [];

        const mapped: InscriptionItem[] = items.map((insc: any) => {
          const childName = insc.enfant
            ? `${insc.enfant.prenom ?? ""} ${insc.enfant.nom ?? ""}`.trim() || "—"
            : "—";
          const firstParent = Array.isArray(insc.parents) && insc.parents.length > 0 ? insc.parents[0] : null;
          const parentName = firstParent?.nom ?? "—";
          const email = firstParent?.email ?? "—";

          const statut: InscriptionItem["statutCode"] = insc.statut ?? null;
          let statusLabel = "";
          if (statut === "CANDIDATURE") statusLabel = "En revue";
          else if (statut === "EN_COURS") statusLabel = "En cours";
          else if (statut === "ACTIF") statusLabel = "Accepté";
          else if (statut === "REJETEE") statusLabel = "Refusé";
          else statusLabel = "Inconnu";

          return {
            id: insc.id,
            childName,
            parentName,
            email,
            status: statusLabel,
            statutCode: statut,
            createdAt: insc.createdAt,
          };
        });

        if (!cancelled) {
          setInscriptions(mapped);
        }
      } catch (err) {
        console.error("[Admin/Inscriptions] Error loading inscriptions", err);
        if (!cancelled) {
          setError("Impossible de charger les inscriptions.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchInscriptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = inscriptions.filter((insc) =>
    insc.childName.toLowerCase().includes(search.toLowerCase()) ||
    insc.parentName.toLowerCase().includes(search.toLowerCase()) ||
    insc.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SidebarNew currentLocale={currentLocale} />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{inscriptions.length} inscriptions</p>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement des inscriptions…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune inscription trouvée.</p>
            ) : (
              filtered.map((insc) => (
                <Card key={insc.id} className="p-6 border-2 border-border/50">
                  <div className="mb-4 pb-4 border-b border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{insc.childName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(insc.createdAt).toLocaleDateString(currentLocale)}
                        </p>
                      </div>
                      <Badge
                        className={
                          insc.status === "Accepté"
                            ? "bg-green-100 text-green-700"
                            : insc.status === "En revue"
                            ? "bg-yellow-100 text-yellow-700"
                            : insc.status === "En cours"
                            ? "bg-blue-100 text-blue-700"
                            : insc.status === "Refusé"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      >
                        {insc.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("parent")}:</span>
                      <span className="font-medium">{insc.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{insc.email}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Eye className="w-4 h-4" />
                      {t("viewDetails")}
                    </Button>
                    {insc.statutCode === 'CANDIDATURE' || insc.statutCode === 'EN_COURS' ? (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          onClick={() => handleAccept(insc.id)}
                        >
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(insc.id)}
                        >
                          Rejeter
                        </Button>
                      </>
                    ) : null}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
                                
