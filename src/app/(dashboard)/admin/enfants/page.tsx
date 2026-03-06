"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Eye, Edit2, X } from "lucide-react";
import { apiClient } from "@/lib/api";

interface EnfantItem {
  id: string;
  prenom: string;
  nom: string;
  genre?: string;
  classeId?: string;
  remarques?: string;
  classe?: { id: string; nom: string };
  famille?: { tuteurs?: Array<{ prenom: string; nom: string }> };
}

interface ClasseOption {
  id: string;
  nom: string;
}

interface EditForm {
  prenom: string;
  nom: string;
  genre: string;
  classeId: string;
  remarques: string;
}

export default function EnfantsAdminPage() {
  const [children, setChildren] = useState<EnfantItem[]>([]);
  const [classes, setClasses] = useState<ClasseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingChild, setEditingChild] = useState<EnfantItem | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    prenom: "",
    nom: "",
    genre: "",
    classeId: "",
    remarques: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [childrenRes, classesRes] = await Promise.all([
        apiClient.listChildren(1, 200),
        apiClient.listClasses(),
      ]);
      const items =
        childrenRes.data?.data ??
        childrenRes.data?.items ??
        childrenRes.data ??
        [];
      const classItems =
        classesRes.data?.data ??
        classesRes.data?.items ??
        classesRes.data ??
        [];
      setChildren(Array.isArray(items) ? items : []);
      setClasses(Array.isArray(classItems) ? classItems : []);
    } catch (err) {
      console.error("[Enfants] Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (child: EnfantItem) => {
    setEditingChild(child);
    setEditForm({
      prenom: child.prenom ?? "",
      nom: child.nom ?? "",
      genre: child.genre ?? "",
      classeId: child.classeId ?? child.classe?.id ?? "",
      remarques: child.remarques ?? "",
    });
    setSaveError(null);
  };

  const closeEdit = () => {
    setEditingChild(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!editingChild) return;
    try {
      setSaving(true);
      setSaveError(null);
      await apiClient.updateChild(editingChild.id, {
        prenom: editForm.prenom,
        nom: editForm.nom,
        genre: editForm.genre || undefined,
        classeId: editForm.classeId || undefined,
        remarques: editForm.remarques || undefined,
      });
      setChildren((prev) =>
        prev.map((c) =>
          c.id === editingChild.id
            ? {
                ...c,
                prenom: editForm.prenom,
                nom: editForm.nom,
                genre: editForm.genre,
                classeId: editForm.classeId,
                remarques: editForm.remarques,
                classe: editForm.classeId
                  ? (classes.find((cl) => cl.id === editForm.classeId) ?? c.classe)
                  : c.classe,
              }
            : c
        )
      );
      closeEdit();
    } catch (err) {
      console.error("[Enfants] Error saving child:", err);
      setSaveError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = children.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.prenom?.toLowerCase().includes(q) ||
      c.nom?.toLowerCase().includes(q) ||
      c.classe?.nom?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Enfants</h1>
        <div className="text-center py-12">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enfants</h1>
          <p className="text-muted-foreground mt-1">
            {children.length} enfant(s) inscrit(s)
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Rechercher par nom ou classe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-4 font-medium">Enfant</th>
                <th className="text-left p-4 font-medium">Genre</th>
                <th className="text-left p-4 font-medium">Classe</th>
                <th className="text-left p-4 font-medium">Parent</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    Aucun enfant.
                  </td>
                </tr>
              ) : (
                filtered.map((child) => (
                  <tr key={child.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium">
                      {child.prenom} {child.nom}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {child.genre === "M" ? "Garcon" : child.genre === "F" ? "Fille" : "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {child.classe?.nom ?? "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {child.famille?.tuteurs?.[0]
                        ? child.famille.tuteurs[0].prenom + " " + child.famille.tuteurs[0].nom
                        : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <a
                          href={"/fr/admin/enfants/" + child.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-md text-xs hover:bg-muted transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Voir profil
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                Modifier {editingChild.prenom} {editingChild.nom}
              </h2>
              <Button size="sm" variant="ghost" onClick={closeEdit}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prenom</label>
                  <Input
                    value={editForm.prenom}
                    onChange={(e) => setEditForm((f) => ({ ...f, prenom: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <Input
                    value={editForm.nom}
                    onChange={(e) => setEditForm((f) => ({ ...f, nom: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Genre</label>
                  <select
                    value={editForm.genre}
                    onChange={(e) => setEditForm((f) => ({ ...f, genre: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  >
                    <option value="">— Non specifie —</option>
                    <option value="M">Garcon</option>
                    <option value="F">Fille</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Classe</label>
                  <select
                    value={editForm.classeId}
                    onChange={(e) => setEditForm((f) => ({ ...f, classeId: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  >
                    <option value="">— Aucune classe —</option>
                    {classes.map((cl) => (
                      <option key={cl.id} value={cl.id}>{cl.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Remarques</label>
                <Textarea
                  value={editForm.remarques}
                  onChange={(e) => setEditForm((f) => ({ ...f, remarques: e.target.value }))}
                  placeholder="Remarques ou notes..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              {saveError && <p className="text-sm text-destructive">{saveError}</p>}

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
                <Button variant="outline" onClick={closeEdit} disabled={saving}>
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
