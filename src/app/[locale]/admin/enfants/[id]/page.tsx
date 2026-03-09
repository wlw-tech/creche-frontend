"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Locale } from "@/lib/i18n/config";
import { apiClient } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { Pencil, X, Plus, Trash2, Save } from "lucide-react";

export default function EnfantDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const resolvedParams = use(params);
  const { locale, id } = resolvedParams;
  const t = useTranslations("admin.children");

  const [enfant, setEnfant]   = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── Edit form state ───────────────────────────────────────────────────────
  const [editing, setEditing]   = useState(false);
  const [editForm, setEditForm] = useState({
    prenom: "", nom: "", genre: "", classeId: "", photoUrl: "", remarques: "",
  });
  const [saving, setSaving]     = useState(false);
  const [editErr, setEditErr]   = useState<string | null>(null);

  // ── Delegation form ───────────────────────────────────────────────────────
  const [showDelForm, setShowDelForm] = useState(false);
  const [delForm, setDelForm] = useState({ nom: "", telephone: "", cin: "", relation: "" });
  const [delSaving, setDelSaving]     = useState(false);
  const [delErr, setDelErr]           = useState<string | null>(null);

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [childRes, classesRes] = await Promise.all([
          apiClient.getChild(id),
          apiClient.listClasses(),
        ]);
        if (!cancelled) {
          setEnfant(childRes.data);
          setClasses(Array.isArray(classesRes.data) ? classesRes.data : classesRes.data?.data ?? []);
        }
      } catch {
        if (!cancelled) setError("Impossible de charger la fiche enfant.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const openEdit = () => {
    if (!enfant) return;
    setEditForm({
      prenom:    enfant.prenom   ?? "",
      nom:       enfant.nom      ?? "",
      genre:     enfant.genre    ?? "",
      classeId:  enfant.classeId ?? "",
      photoUrl:  enfant.photoUrl ?? "",
      remarques: enfant.remarques ?? "",
    });
    setEditErr(null);
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true); setEditErr(null);
    try {
      const res = await apiClient.updateChild(id, {
        prenom:    editForm.prenom   || undefined,
        nom:       editForm.nom      || undefined,
        genre:     editForm.genre    || undefined,
        classeId:  editForm.classeId || null,
        photoUrl:  editForm.photoUrl || null,
        remarques: editForm.remarques || null,
      });
      setEnfant((prev: any) => ({ ...prev, ...res.data }));
      setEditing(false);
    } catch {
      setEditErr("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const addDelegation = async () => {
    if (!delForm.nom.trim()) { setDelErr("Le nom est obligatoire."); return; }
    setDelSaving(true); setDelErr(null);
    try {
      const res = await apiClient.addDelegation(id, delForm);
      setEnfant((prev: any) => ({ ...prev, delegations: [...(prev.delegations ?? []), res.data] }));
      setDelForm({ nom: "", telephone: "", cin: "", relation: "" });
      setShowDelForm(false);
    } catch {
      setDelErr("Erreur lors de l'ajout.");
    } finally {
      setDelSaving(false);
    }
  };

  const removeDelegation = async (delegationId: string) => {
    if (!confirm("Supprimer cette personne autorisée ?")) return;
    try {
      await apiClient.deleteDelegation(id, delegationId);
      setEnfant((prev: any) => ({ ...prev, delegations: prev.delegations.filter((d: any) => d.id !== delegationId) }));
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNew currentLocale={locale} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 flex items-center justify-center">
        <p className="text-muted-foreground">Chargement de la fiche enfant…</p>
      </div>
    </div>
  );

  if (error || !enfant) return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNew currentLocale={locale} />
      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 flex items-center justify-center">
        <p className="text-destructive text-sm">{error ?? "Fiche enfant introuvable."}</p>
      </div>
    </div>
  );

  const fullName   = `${enfant.prenom} ${enfant.nom}`.trim();
  const group      = enfant.classe?.nom ?? "—";
  const tuteurs    = enfant.famille?.tuteurs ?? [];
  const birthdate  = enfant.dateNaissance ? new Date(enfant.dateNaissance) : null;
  const profilSante = enfant.profilSante ?? null;
  const allergies: any[] = Array.isArray(profilSante?.allergies) ? profilSante.allergies : [];
  const intolerances: any[] = Array.isArray(profilSante?.intolerances) ? profilSante.intolerances : [];
  const tags: string[]  = Array.isArray(profilSante?.tags) ? profilSante.tags : [];
  const delegations: any[] = Array.isArray(enfant.delegations) ? enfant.delegations : [];
  const inscription = Array.isArray(enfant.inscriptions) && enfant.inscriptions.length > 0 ? enfant.inscriptions[0] : null;
  const payload     = inscription?.payload ?? null;
  const sante       = payload?.sante ?? null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNew currentLocale={locale} />

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center flex-shrink-0">
                {enfant.photoUrl
                  ? <img src={enfant.photoUrl} alt={fullName} className="w-full h-full object-cover" />
                  : <span className="text-2xl">👧</span>}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{fullName}</h1>
                <p className="text-sm text-muted-foreground">Classe : {group}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={openEdit} className="flex items-center gap-1.5">
                <Pencil className="w-4 h-4" /> Modifier
              </Button>
              <Button variant="outline" onClick={() => history.back()}>{t("backToList")}</Button>
            </div>
          </div>

          {/* ── Edit modal ─────────────────────────────────────────────── */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
                  <h2 className="font-bold text-base">Modifier la fiche enfant</h2>
                  <button onClick={() => setEditing(false)}><X className="w-4 h-4" /></button>
                </div>
                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Prénom</label>
                      <Input value={editForm.prenom} onChange={e => setEditForm(p => ({ ...p, prenom: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nom</label>
                      <Input value={editForm.nom} onChange={e => setEditForm(p => ({ ...p, nom: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Genre</label>
                    <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                      value={editForm.genre} onChange={e => setEditForm(p => ({ ...p, genre: e.target.value }))}>
                      <option value="">— Non précisé —</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Classe assignée</label>
                    <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                      value={editForm.classeId} onChange={e => setEditForm(p => ({ ...p, classeId: e.target.value }))}>
                      <option value="">— Aucune classe —</option>
                      {classes.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.nom}{c.niveau ? ` (${c.niveau})` : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Photo</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) { alert("Image trop grande (max 5 Mo)"); return; }
                        const reader = new FileReader();
                        reader.onload = () => setEditForm(p => ({ ...p, photoUrl: reader.result as string }));
                        reader.readAsDataURL(file);
                      }}
                      className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                    {editForm.photoUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={editForm.photoUrl} alt="preview" className="w-16 h-16 rounded-xl object-cover border" />
                        <button type="button" onClick={() => setEditForm(p => ({ ...p, photoUrl: "" }))} className="text-xs text-destructive hover:underline">Supprimer la photo</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Remarques / Notes admin</label>
                    <textarea
                      className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background min-h-[80px] resize-none"
                      value={editForm.remarques}
                      onChange={e => setEditForm(p => ({ ...p, remarques: e.target.value }))}
                      placeholder="Notes internes visibles uniquement par les admins…"
                    />
                  </div>
                  {editErr && <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">{editErr}</p>}
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20">
                  <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>Annuler</Button>
                  <Button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5">
                    <Save className="w-4 h-4" />{saving ? "Enregistrement…" : "Enregistrer"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Row 1: Info enfant + Fiche santé ──────────────────────── */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-semibold mb-1">Informations enfant</h2>
              {enfant.photoUrl && (
                <img src={enfant.photoUrl} alt={fullName} className="w-28 h-28 rounded-xl object-cover border border-border mb-2" />
              )}
              <InfoRow label="Nom complet" value={fullName} />
              <InfoRow label="Classe" value={group} />
              <InfoRow label="Date de naissance" value={birthdate ? birthdate.toLocaleDateString(locale) : "—"} />
              <InfoRow label="Genre" value={enfant.genre ?? "—"} />
              {enfant.remarques && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Remarques admin</p>
                  <p className="text-sm text-amber-900">{enfant.remarques}</p>
                </div>
              )}
              {payload && (
                <>
                  {sante?.taille && <InfoRow label="Taille" value={`${sante.taille} cm`} />}
                  {sante?.poids  && <InfoRow label="Poids"  value={`${sante.poids} kg`} />}
                  {payload.commentaire && <InfoRow label="Commentaire" value={payload.commentaire} />}
                </>
              )}
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="text-lg font-semibold mb-1">Fiche santé</h2>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Allergies</p>
                {allergies.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {allergies.map((a: any, i: number) => (
                      <li key={i} className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-200">
                        {typeof a === "string" ? a : a.nom}{a.severite && ` (${a.severite})`}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">Aucune allergie.</p>}
              </div>
              {intolerances.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Intolérances</p>
                  <ul className="flex flex-wrap gap-2">
                    {intolerances.map((i: any) => (
                      <li key={i.id} className="px-2 py-1 text-xs rounded-full bg-orange-50 text-orange-700 border border-orange-200">{i.nom}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(tags.length > 0 || sante?.tags?.length > 0) && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tags santé</p>
                  <ul className="flex flex-wrap gap-2">
                    {(tags.length > 0 ? tags : sante?.tags ?? []).map((tag: string) => (
                      <li key={tag} className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">{tag}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sante && (
                <div className="space-y-1 text-sm">
                  {sante.restrictionAlimentaire && (
                    <InfoRow label="Restriction alimentaire" value={
                      sante.restrictionAlimentaire === "sans_restriction" ? "Sans restriction" :
                      sante.restrictionAlimentaire === "sans_porc"        ? "Sans porc"        :
                      sante.restrictionAlimentaire === "vegetarien"       ? "Végétarien"       :
                      sante.restrictionAlimentaire === "sans_gluten"      ? "Sans gluten"      :
                      sante.restrictionDetails || sante.restrictionAlimentaire
                    } />
                  )}
                  {sante.maladieChronique && <InfoRow label="Maladie chronique" value={sante.maladieChronique} />}
                  {sante.medicaments && <InfoRow label="Médicaments" value={sante.medicaments} />}
                </div>
              )}
            </Card>
          </div>

          {/* ── Personnes autorisées (Delegation) ─────────────────────── */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Personnes autorisées à récupérer l'enfant</h2>
              <Button size="sm" onClick={() => { setShowDelForm(true); setDelErr(null); }} className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Ajouter
              </Button>
            </div>

            {/* Add delegation form */}
            {showDelForm && (
              <div className="mb-4 p-4 border border-border rounded-xl bg-muted/20 space-y-3">
                <p className="text-sm font-semibold">Nouvelle personne autorisée</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Nom complet *</label>
                    <Input value={delForm.nom} onChange={e => setDelForm(p => ({ ...p, nom: e.target.value }))} placeholder="Prénom Nom" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Téléphone</label>
                    <Input value={delForm.telephone} onChange={e => setDelForm(p => ({ ...p, telephone: e.target.value }))} placeholder="+212 6..." />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">CIN</label>
                    <Input value={delForm.cin} onChange={e => setDelForm(p => ({ ...p, cin: e.target.value }))} placeholder="AB123456" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Relation</label>
                    <Input value={delForm.relation} onChange={e => setDelForm(p => ({ ...p, relation: e.target.value }))} placeholder="Grand-mère, Oncle…" />
                  </div>
                </div>
                {delErr && <p className="text-xs text-destructive">{delErr}</p>}
                <div className="flex gap-2">
                  <Button size="sm" onClick={addDelegation} disabled={delSaving}>{delSaving ? "…" : "Ajouter"}</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowDelForm(false)}>Annuler</Button>
                </div>
              </div>
            )}

            {delegations.length === 0 && !showDelForm ? (
              <p className="text-sm text-muted-foreground">Aucune personne autorisée enregistrée.</p>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-3">
                {delegations.map((d: any) => (
                  <li key={d.id} className="p-3 rounded-xl border border-border bg-white flex justify-between items-start gap-2">
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">{d.nom}</p>
                      {d.relation  && <p className="text-xs text-muted-foreground">Lien : {d.relation}</p>}
                      {d.telephone && <p className="text-xs text-muted-foreground">Tél : {d.telephone}</p>}
                      {d.cin       && <p className="text-xs text-muted-foreground">CIN : {d.cin}</p>}
                    </div>
                    <button onClick={() => removeDelegation(d.id)} className="text-red-400 hover:text-red-600 mt-0.5 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* ── Personnes autorisées depuis payload inscription ────────── */}
          {payload?.personnesAutorisees?.length > 0 && delegations.length === 0 && (
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-semibold mb-2">Personnes autorisées (formulaire inscription)</h2>
              <ul className="grid md:grid-cols-2 gap-3 text-sm">
                {payload.personnesAutorisees.map((p: any, i: number) => (
                  <li key={i} className="p-3 rounded-lg border border-border bg-muted/20">
                    <p className="font-medium">{p.name || "—"}</p>
                    {p.relationship && <p className="text-xs text-muted-foreground">Lien : {p.relationship}</p>}
                    {p.phone && <p className="text-xs text-muted-foreground">Tél : {p.phone}</p>}
                    {p.cin   && <p className="text-xs text-muted-foreground">CIN : {p.cin}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* ── Parents / tuteurs + Présences ─────────────────────────── */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 space-y-3">
              <h2 className="text-lg font-semibold mb-2">Parents / tuteurs</h2>
              {tuteurs.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {tuteurs.map((tut: any) => (
                    <li key={tut.id} className="border-b last:border-b-0 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{`${tut.prenom ?? ""} ${tut.nom ?? ""}`.trim() || tut.telephone || "—"}</span>
                        {tut.principal && <Badge className="bg-emerald-100 text-emerald-700 text-[11px]">Principal</Badge>}
                      </div>
                      {tut.lien      && <p className="text-xs text-muted-foreground">Lien : {tut.lien}</p>}
                      {tut.telephone && <p className="text-xs text-muted-foreground">Tel : {tut.telephone}</p>}
                      {tut.email     && <p className="text-xs text-muted-foreground">Email : {tut.email}</p>}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted-foreground">Aucun tuteur.</p>}
            </Card>
          </div>

          {/* ── Dossier inscription ────────────────────────────────────── */}
          {inscription && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-3">Dossier d'inscription</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <InfoRow label="ID"     value={inscription.id} />
                <InfoRow label="Statut" value={inscription.statut} />
                <InfoRow label="Date"   value={new Date(inscription.createdAt).toLocaleDateString(locale, { day: "2-digit", month: "long", year: "numeric" })} />
                {payload?.famille?.emailPrincipal && <InfoRow label="Email famille" value={payload.famille.emailPrincipal} />}
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
