"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api";

interface MenuItem {
  id: string;
  date: string;
  collationMatin: string | null;
  repas: string | null;
  gouter: string | null;
  allergenes: string[];
  statut: "Brouillon" | "Publie";
}

// Parse ISO date string as local midnight (avoids UTC offset shifting the date)
const parseLocalDate = (iso: string): Date => {
  const [y, mo, d] = iso.split("-").map(Number);
  return new Date(y, mo - 1, d);
};

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    collationMatin: "",
    repas: "",
    gouter: "",
    allergenes: "",
  });

  useEffect(() => {
    void fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listMenus(1, 50);
      const items = response.data?.data ?? response.data?.items ?? [];
      setMenus(items);
    } catch (err) {
      console.error("[Menus] Error fetching menus:", err);
      setError("Erreur lors du chargement des menus.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allergenesArray = formData.allergenes
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const payload = {
      date: formData.date,
      collationMatin: formData.collationMatin,
      repas: formData.repas,
      gouter: formData.gouter,
      allergenes: allergenesArray,
    };

    try {
      setError(null);
      if (editingId) {
        await apiClient.updateMenu(editingId, payload);
      } else {
        await apiClient.createMenu(payload);
      }
      await fetchMenus();
      setFormData({ date: "", collationMatin: "", repas: "", gouter: "", allergenes: "" });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("[Menus] Error saving menu:", err);
      setError("Erreur lors de la sauvegarde.");
    }
  };

  const handleEdit = (menu: MenuItem) => {
    setFormData({
      date: menu.date,
      collationMatin: menu.collationMatin ?? "",
      repas: menu.repas ?? "",
      gouter: menu.gouter ?? "",
      allergenes: menu.allergenes.join(", "),
    });
    setEditingId(menu.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, statut: string) => {
    if (statut === "Publie") {
      setError("Impossible de supprimer un menu publié. Dépubliez-le d'abord.");
      return;
    }
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce menu ?")) return;
    try {
      setError(null);
      await apiClient.deleteMenu(id);
      await fetchMenus();
    } catch (err) {
      console.error("[Menus] Error deleting menu:", err);
      setError("Erreur lors de la suppression.");
    }
  };

  const handlePublish = async (id: string, statut: string) => {
    if (statut === "Publie") return;
    try {
      setError(null);
      await apiClient.publishMenu(id);
      await fetchMenus();
    } catch (err) {
      console.error("[Menus] Error publishing menu:", err);
      setError("Erreur lors de la publication.");
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!confirm("Dépublier ce menu ? Il repassera en Brouillon.")) return;
    try {
      setError(null);
      await apiClient.unpublishMenu(id);
      await fetchMenus();
    } catch (err) {
      console.error("[Menus] Error unpublishing menu:", err);
      setError("Erreur lors de la dépublication.");
    }
  };

  const formatDate = (dateStr: string) => {
    return parseLocalDate(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Menu enfant</h1>
        <div className="text-center py-12">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu enfant</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les menus quotidiens de la crèche
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          {showForm ? "Fermer le formulaire" : "Ajouter un menu"}
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive/30">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {/* Form */}
      {showForm && (
        <Card className="p-6 border-2 border-primary/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {editingId ? "Modifier le menu" : "Créer un nouveau menu"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date
                </label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  🍎 Collation du matin
                </label>
                <Input
                  type="text"
                  name="collationMatin"
                  placeholder="Ex: Yaourt, fruits frais"
                  value={formData.collationMatin}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  🍽️ Repas (déjeuner)
                </label>
                <Input
                  type="text"
                  name="repas"
                  placeholder="Ex: Poulet rôti, riz"
                  value={formData.repas}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  🧃 Goûter
                </label>
                <Input
                  type="text"
                  name="gouter"
                  placeholder="Ex: Compote, lait"
                  value={formData.gouter}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Allergènes
              </label>
              <Textarea
                name="allergenes"
                placeholder="Entrez les allergènes séparés par des virgules (ex: Arachides, Noix, Gluten)"
                value={formData.allergenes}
                onChange={handleInputChange}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Séparez les allergènes par des virgules
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {editingId ? "Mettre à jour" : "Créer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ date: "", collationMatin: "", repas: "", gouter: "", allergenes: "" });
                }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Menus List */}
      <div className="grid gap-4">
        {menus.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              Aucun menu créé. Commencez par ajouter un menu.
            </p>
          </Card>
        ) : (
          menus.map((menu) => (
            <Card
              key={menu.id}
              className="p-6 border-2 border-secondary/30 hover:border-secondary/60 transition-colors bg-gradient-to-r from-white to-secondary/5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-foreground">
                      {formatDate(menu.date)}
                    </h3>
                    {menu.statut === "Publie" ? (
                      <Badge className="bg-secondary text-secondary-foreground font-semibold">
                        Publié
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-secondary/50">
                        Brouillon
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {menu.statut === "Publie" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnpublish(menu.id)}
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      Dépublier
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePublish(menu.id, menu.statut)}
                    >
                      Publier
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(menu)}
                    className="gap-1"
                    disabled={menu.statut === "Publie"}
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(menu.id, menu.statut)}
                    className="gap-1 text-destructive hover:bg-destructive/10"
                    disabled={menu.statut === "Publie"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-lg">
                  <p className="text-xs font-bold text-blue-700 uppercase mb-1">
                    🍎 Collation matin
                  </p>
                  <p className="font-bold text-blue-900 text-base">
                    {menu.collationMatin || <span className="text-blue-400 italic font-normal text-sm">—</span>}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600 rounded-lg">
                  <p className="text-xs font-bold text-orange-700 uppercase mb-1">
                    🍽️ Repas
                  </p>
                  <p className="font-bold text-orange-900 text-base">
                    {menu.repas || <span className="text-orange-400 italic font-normal text-sm">—</span>}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-600 rounded-lg">
                  <p className="text-xs font-bold text-red-700 uppercase mb-1">
                    🧃 Goûter
                  </p>
                  <p className="font-bold text-red-900 text-base">
                    {menu.gouter || <span className="text-red-400 italic font-normal text-sm">—</span>}
                  </p>
                </div>
              </div>

              {menu.allergenes.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-bold text-red-700 uppercase mb-2">
                    Allergènes détectés
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {menu.allergenes.map((allergen) => (
                      <Badge
                        key={allergen}
                        className="bg-red-600 text-white font-semibold hover:bg-red-700"
                      >
                        ⚠️ {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
