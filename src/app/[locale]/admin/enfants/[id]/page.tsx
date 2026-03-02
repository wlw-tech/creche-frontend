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
        <div className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement de la fiche enfant…</p>
        </div>
      </div>
    );
  }

  if (error || !enfant) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarNew currentLocale={locale} />
        <div className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 flex items-center justify-center">
          <p className="text-destructive text-sm">{error ?? "Fiche enfant introuvable."}</p>
        </div>
      </div>
    );
  }

  const fullName = `${enfant.prenom} ${enfant.nom}`.trim();
  const group = enfant.classe?.nom ?? "—";
  const tuteurs = enfant.famille?.tuteurs ?? [];
  const principal = tuteurs.find((t: any) => t.principal) ?? tuteurs[0];
  const birthdate = enfant.dateNaissance ? new Date(enfant.dateNaissance) : null;

  // Health profile
  const profilSante = enfant.profilSante ?? null;
  const allergies: any[] = Array.isArray(profilSante?.allergies)
    ? profilSante.allergies
    : Array.isArray(enfant.allergies)
    ? enfant.allergies.map((a: string) => ({ nom: a }))
    : [];
  const intolerances: any[] = Array.isArray(profilSante?.intolerances) ? profilSante.intolerances : [];
  const tags: string[] = Array.isArray(profilSante?.tags) ? profilSante.tags : [];

  // Inscription data (payload)
  const inscription = Array.isArray(enfant.inscriptions) && enfant.inscriptions.length > 0
    ? enfant.inscriptions[0]
    : null;
  const payload = inscription?.payload ?? null;
  const sante = payload?.sante ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNew currentLocale={locale} />

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Photo de l'enfant */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center flex-shrink-0">
                {enfant.photoUrl ? (
                  <img
                    src={enfant.photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">👧</span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">{fullName}</h1>
                <p className="text-sm text-muted-foreground">Classe : {group}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => history.back()}>
              {t("backToList")}
            </Button>
          </div>

          {/* Row 1: Infos enfant + Fiche santé */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Fiche enfant */}
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-semibold mb-1">Informations enfant</h2>
              {enfant.photoUrl && (
                <div className="mb-3">
                  <img
                    src={enfant.photoUrl}
                    alt={fullName}
                    className="w-32 h-32 rounded-xl object-cover border border-border"
                  />
                </div>
              )}
              <InfoRow label="Nom complet" value={fullName} />
              <InfoRow label="Classe" value={group} />
              <InfoRow
                label="Date de naissance"
                value={birthdate ? birthdate.toLocaleDateString(locale) : "—"}
              />
              <InfoRow label="Genre" value={enfant.genre ?? "—"} />

              {/* Données d'inscription */}
              {payload && (
                <>
                  {sante?.taille && <InfoRow label="Taille" value={`${sante.taille} cm`} />}
                  {sante?.poids && <InfoRow label="Poids" value={`${sante.poids} kg`} />}
                  {payload.classeIdSouhaitee && (
                    <InfoRow label="Classe souhaitée" value={payload.classeIdSouhaitee} />
                  )}
                  {payload.commentaire && (
                    <InfoRow label="Commentaire" value={payload.commentaire} />
                  )}
                </>
              )}
            </Card>

            {/* Fiche santé complète */}
            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-1">Fiche santé</h2>

              {/* Allergies */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Allergies</p>
                {allergies.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {allergies.map((a: any, i: number) => (
                      <li key={i} className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200">
                        {typeof a === "string" ? a : a.nom}
                        {a.severite && ` (${a.severite})`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune allergie renseignée.</p>
                )}
              </div>

              {/* Intolérances */}
              {(intolerances.length > 0 || sante?.intolerances) && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Intolérances</p>
                  {intolerances.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {intolerances.map((i: any) => (
                        <li key={i.id} className="px-2 py-1 text-xs rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                          {i.nom}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">{sante?.intolerances}</p>
                  )}
                </div>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tags santé</p>
                  <ul className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <li key={tag} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags from payload */}
              {!tags.length && sante?.tags?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tags santé</p>
                  <ul className="flex flex-wrap gap-2">
                    {sante.tags.map((tag: string) => (
                      <li key={tag} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Restrictions + délégation depuis payload */}
              {sante && (
                <div className="space-y-2 text-sm">
                  {sante.restrictionAlimentaire && (
                    <InfoRow label="Restriction alimentaire" value={
                      sante.restrictionAlimentaire === "sans_restriction" ? "Sans restriction" :
                      sante.restrictionAlimentaire === "sans_porc" ? "Sans porc" :
                      sante.restrictionAlimentaire === "vegetarien" ? "Végétarien" :
                      sante.restrictionAlimentaire === "sans_gluten" ? "Sans gluten" :
                      sante.restrictionDetails || sante.restrictionAlimentaire
                    } />
                  )}
                  {sante.maladieChronique && <InfoRow label="Maladie chronique" value={sante.maladieChronique} />}
                  {sante.medicaments && <InfoRow label="Médicaments" value={sante.medicaments} />}
                  {sante.antecedentsFamiliaux && <InfoRow label="Antécédents familiaux" value={sante.antecedentsFamiliaux} />}
                  {sante.interventionsChirurgicales && <InfoRow label="Interventions chirurgicales" value={sante.interventionsChirurgicales} />}
                  {sante.delegationAutorisee !== undefined && (
                    <InfoRow label="Délégation parentale" value={sante.delegationAutorisee ? "Autorisée" : "Non autorisée"} />
                  )}
                  {sante.delegationDetails && <InfoRow label="Détails délégation" value={sante.delegationDetails} />}
                </div>
              )}

              {profilSante?.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes médicales</p>
                  <p className="text-sm text-muted-foreground">{profilSante.notes}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Row 2: Personnes autorisées depuis payload */}
          {payload?.personnesAutorisees?.length > 0 && (
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-semibold mb-2">Personnes autorisées (inscription)</h2>
              <ul className="grid md:grid-cols-2 gap-3 text-sm">
                {payload.personnesAutorisees.map((p: any, i: number) => (
                  <li key={i} className="p-3 rounded-lg border border-border bg-muted/20">
                    <p className="font-medium">{p.name || "—"}</p>
                    {p.relationship && <p className="text-xs text-muted-foreground">Lien : {p.relationship}</p>}
                    {p.phone && <p className="text-xs text-muted-foreground">Tél : {p.phone}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Row 3: Parents / tuteurs + Présences */}
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
                      {tut.lien && <p className="text-xs text-muted-foreground">Lien : {tut.lien}</p>}
                      {tut.telephone && <p className="text-xs text-muted-foreground">Tel : {tut.telephone}</p>}
                      {tut.email && <p className="text-xs text-muted-foreground">Email : {tut.email}</p>}
                      {tut.adresse && <p className="text-xs text-muted-foreground">Adresse : {tut.adresse}</p>}
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

          {/* Données complètes de l'inscription */}
          {inscription && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-3">Dossier d'inscription</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <InfoRow label="ID inscription" value={inscription.id} />
                <InfoRow label="Statut" value={inscription.statut} />
                <InfoRow
                  label="Date de candidature"
                  value={new Date(inscription.createdAt).toLocaleDateString(locale, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                />
                {payload?.famille?.emailPrincipal && (
                  <InfoRow label="Email famille" value={payload.famille.emailPrincipal} />
                )}
                {payload?.famille?.adresseFacturation && (
                  <InfoRow label="Adresse facturation" value={payload.famille.adresseFacturation} />
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground mr-2">{label} :</span>
      <span className="font-medium">{value}</span>
    </p>
  );
}
