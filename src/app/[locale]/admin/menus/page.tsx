"use client";

import type React from "react";
import { useState, useEffect, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { Locale } from "@/lib/i18n/config";

interface MenuItem {
  id: string;
  date: string;
  entree: string | null;
  plat: string | null;
  dessert: string | null;
  allergenes: string[];
  statut: "Brouillon" | "Publie";
}

export default function MenusPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const currentLocale = resolvedParams.locale;
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    entree: "",
    plat: "",
    dessert: "",
    allergenes: "",
  });

  // Charger les menus au mount
  useEffect(() => {
    void fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.listMenus(1, 50);
      // backend = { data: MenuResponseDto[], total, ... }
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
      entree: formData.entree,
      plat: formData.plat,
      dessert: formData.dessert,
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
      setFormData({
        date: "",
        entree: "",
        plat: "",
        dessert: "",
        allergenes: "",
      });
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
      entree: menu.entree ?? "",
      plat: menu.plat ?? "",
      dessert: menu.dessert ?? "",
      allergenes: menu.allergenes.join(", "),
    });
    setEditingId(menu.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, statut: string) => {
    if (statut === "Publie") {
      setError("Impossible de supprimer un menu publié.");
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
    if (statut === "Publie") return; // backend renverra 400 sinon

    try {
      setError(null);
      await apiClient.publishMenu(id);
      await fetchMenus();
    } catch (err) {
      console.error("[Menus] Error publishing menu:", err);
      setError("Erreur lors de la publication.");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarNew currentLocale={currentLocale} />
        <div className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold">Menu enfant</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNew currentLocale={currentLocale} />

      <div className="flex-1 ml-64 p-8">
        <div className="space-y-6 max-w-5xl mx-auto">
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
                      Entrée
                    </label>
                    <Input
                      type="text"
                      name="entree"
                      placeholder="Ex: Salade"
                      value={formData.entree}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Plat principal
                    </label>
                    <Input
                      type="text"
                      name="plat"
                      placeholder="Ex: Poulet riz"
                      value={formData.plat}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Dessert
                    </label>
                    <Input
                      type="text"
                      name="dessert"
                      placeholder="Ex: Fruit"
                      value={formData.dessert}
                      onChange={handleInputChange}
                      required
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
                      setFormData({
                        date: "",
                        entree: "",
                        plat: "",
                        dessert: "",
                        allergenes: "",
                      });
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
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePublish(menu.id, menu.statut)}
                        disabled={menu.statut === "Publie"}
                        className={
                          menu.statut === "Publie"
                            ? "border-secondary text-secondary font-semibold"
                            : ""
                        }
                      >
                        {menu.statut === "Publie" ? "Publié" : "Publier"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(menu)}
                        className="gap-1"
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
                        Entrée
                      </p>
                      <p className="font-bold text-blue-900 text-base">
                        {menu.entree}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600 rounded-lg">
                      <p className="text-xs font-bold text-orange-700 uppercase mb-1">
                        Plat Principal
                      </p>
                      <p className="font-bold text-orange-900 text-base">
                        {menu.plat}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-600 rounded-lg">
                      <p className="text-xs font-bold text-red-700 uppercase mb-1">
                        Dessert
                      </p>
                      <p className="font-bold text-red-900 text-base">
                        {menu.dessert}
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
      </div>
    </div>
  );
}
