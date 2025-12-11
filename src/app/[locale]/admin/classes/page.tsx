"use client";

import { useState, useEffect, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Users } from "lucide-react";
import { apiClient } from "@/lib/api";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { Locale } from "@/lib/i18n/config";

interface Classe {
  id: string;
  nom: string;
  capacite?: number;
  trancheAge?: string;
  active: boolean;
}

export default function ClassesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const currentLocale = resolvedParams.locale;
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    capacite: "",
    trancheAge: "",
    active: true,
  });

  // Charger les classes
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listClasses();
      const payload = response.data;
      const items: any[] = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload)
        ? payload
        : [];
      setClasses(items);
      setError(null);
    } catch (err) {
      console.error("[Classes] Error fetching classes:", err);
      setError("Erreur lors du chargement des classes");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      nom: formData.nom,
      capacite: formData.capacite ? Number(formData.capacite) : null,
      trancheAge: formData.trancheAge || null,
      active: formData.active,
    };

    try {
      if (editingId) {
        await apiClient.updateClass(editingId, payload);
      } else {
        await apiClient.createClass(payload);
      }

      await fetchClasses();

      setFormData({
        nom: "",
        capacite: "",
        trancheAge: "",
        active: true,
      });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("[Classes] Error saving class:", err);
      setError("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (classe: Classe) => {
    setFormData({
      nom: classe.nom,
      capacite: classe.capacite?.toString() || "",
      trancheAge: classe.trancheAge || "",
      active: classe.active,
    });
    setEditingId(classe.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette classe ?")) return;

    try {
      await apiClient.deleteClass(id);
      await fetchClasses();
    } catch (err) {
      console.error("[Classes] Error deleting:", err);
      setError("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarNew currentLocale={currentLocale} />
        <div className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold">Gestion des classes</h1>
            <p className="text-muted-foreground">Chargement…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SidebarNew currentLocale={currentLocale} />

      {/* Main content */}
      <div className="flex-1 ml-64 p-8">
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestion des classes</h1>
              <p className="text-muted-foreground">Organisez vos groupes d’enfants</p>
            </div>

            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              Ajouter une classe
            </Button>
          </div>

          {/* ERREUR */}
          {error && (
            <Card className="p-4 bg-destructive/10 border border-destructive/30">
              <p className="text-destructive">{error}</p>
            </Card>
          )}

          {/* FORMULAIRE */}
          {showForm && (
            <Card className="p-6 border-2 border-primary/20">
              <h2 className="text-lg font-semibold mb-4">
                {editingId ? "Modifier la classe" : "Créer une nouvelle classe"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nom de la classe *
                    </label>
                    <Input
                      name="nom"
                      placeholder="Ex : Petite section"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tranche d’âge
                    </label>
                    <Input
                      name="trancheAge"
                      placeholder="Ex : 2–3 ans"
                      value={formData.trancheAge}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Capacité</label>
                  <Input
                    type="number"
                    name="capacite"
                    placeholder="Ex : 20"
                    value={formData.capacite}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="active" className="text-sm font-medium">
                    Classe active
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    {editingId ? "Mettre à jour" : "Créer"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* LISTE DES CLASSES */}
          <div className="grid gap-4">
            {classes.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">
                  Aucune classe créée pour le moment.
                </p>
              </Card>
            ) : (
              classes.map((classe) => (
                <Card
                  key={classe.id}
                  className="p-6 border-2 border-primary/20 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{classe.nom}</h3>

                        {classe.active ? (
                          <Badge className="bg-secondary text-secondary-foreground">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleEdit(classe)}
                      >
                        <Edit2 className="w-4 h-4" /> Modifier
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(classe.id)}
                      >
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {classe.trancheAge && (
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          Tranche d’âge
                        </p>
                        <p className="font-semibold">{classe.trancheAge}</p>
                      </div>
                    )}

                    {classe.capacite && (
                      <div className="p-3 bg-secondary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          Capacité
                        </p>
                        <p className="font-semibold">{classe.capacite} enfants</p>
                      </div>
                    )}
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
