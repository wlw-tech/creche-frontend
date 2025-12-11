"use client";

import { use, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar } from "lucide-react";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { apiClient } from "@/lib/api";
import { Locale } from "@/lib/i18n/config";

interface EventItem {
  id: string;
  titre: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  classeId?: string | null;
}

interface ClasseItem {
  id: string;
  nom: string;
}

export default function EventsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const currentLocale = resolvedParams.locale;

  const [events, setEvents] = useState<EventItem[]>([]);
  const [classes, setClasses] = useState<ClasseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    classeId: "",
  });

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [eventsRes, classesRes] = await Promise.all([
        apiClient.listAdminEvents({ page: 1, pageSize: 50 }),
        apiClient.listClasses(),
      ]);

      const eventsPayload = eventsRes.data;
      const rawEvents: any[] = Array.isArray(eventsPayload?.data)
        ? eventsPayload.data
        : Array.isArray(eventsPayload?.items)
        ? eventsPayload.items
        : Array.isArray(eventsPayload)
        ? eventsPayload
        : [];

      const classesPayload = classesRes.data;
      const rawClasses: any[] = Array.isArray(classesPayload?.data)
        ? classesPayload.data
        : Array.isArray(classesPayload?.items)
        ? classesPayload.items
        : Array.isArray(classesPayload)
        ? classesPayload
        : [];

      setEvents(
        rawEvents.map((ev: any) => ({
          id: ev.id,
          titre: ev.titre,
          description: ev.description ?? null,
          startAt: ev.startAt,
          endAt: ev.endAt,
          classeId: ev.classeId ?? null,
        })),
      );

      setClasses(
        rawClasses.map((c: any) => ({
          id: c.id,
          nom: c.nom,
        })),
      );
    } catch (err) {
      console.error("[Admin/Events] Error loading events/classes", err);
      setError("Erreur lors du chargement des événements ou des classes.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre || !formData.date || !formData.startTime || !formData.endTime || !formData.classeId) {
      setError("Veuillez renseigner le titre, la date, les heures et la classe.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const startAt = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
      const endAt = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();

      await apiClient.createAdminEvent({
        titre: formData.titre,
        description: formData.description || undefined,
        startAt,
        endAt,
        classeId: formData.classeId,
      });

      await loadData();

      setFormData({
        titre: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        classeId: "",
      });
      setShowForm(false);
    } catch (err: any) {
      console.error("[Admin/Events] Error creating event", err);
      const apiMessage = err?.response?.data?.message;
      if (typeof apiMessage === "string") {
        setError(apiMessage);
      } else if (Array.isArray(apiMessage)) {
        setError(apiMessage.join(" "));
      } else {
        setError("Erreur lors de la création de l'événement.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;

    try {
      setError(null);
      await apiClient.deleteAdminEvent(id);
      await loadData();
    } catch (err) {
      console.error("[Admin/Events] Error deleting event", err);
      setError("Erreur lors de la suppression de l'événement.");
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <SidebarNew currentLocale={currentLocale} />
        <div className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold">Événements</h1>
            <p className="text-muted-foreground">Chargement…</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Événements</h1>
              <p className="text-muted-foreground mt-1">
                Planifiez les réunions, sorties et événements pour les parents.
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              {showForm ? "Fermer le formulaire" : "Ajouter un événement"}
            </Button>
          </div>

          {error && (
            <Card className="p-4 bg-destructive/10 border-destructive/30">
              <p className="text-destructive">{error}</p>
            </Card>
          )}

          {showForm && (
            <Card className="p-6 border-2 border-primary/20">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Créer un nouvel événement
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Titre
                    </label>
                    <Input
                      name="titre"
                      placeholder="Ex: Réunion parents-enseignants"
                      value={formData.titre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Classe
                    </label>
                    <select
                      name="classeId"
                      value={formData.classeId}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Sélectionner une classe…</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    placeholder="Détaillez le lieu, les consignes, etc."
                    value={formData.description}
                    onChange={handleInputChange}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Heure de début
                    </label>
                    <Input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Heure de fin
                    </label>
                    <Input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={saving}>
                    {saving ? "Enregistrement…" : "Créer"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid gap-4">
            {events.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">
                  Aucun événement créé. Commencez par ajouter un événement.
                </p>
              </Card>
            ) : (
              events.map((ev) => (
                <Card
                  key={ev.id}
                  className="p-6 border-2 border-secondary/30 hover:border-secondary/60 transition-colors bg-gradient-to-r from-white to-secondary/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-foreground">{ev.titre}</h3>
                        <Badge className="bg-secondary text-secondary-foreground font-semibold">
                          {ev.classeId
                            ? classes.find((c) => c.id === ev.classeId)?.nom ?? "Classe"
                            : "Général"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDateTime(ev.startAt)} → {formatDateTime(ev.endAt)}
                      </p>
                      {ev.description && (
                        <p className="text-sm text-foreground mt-2">{ev.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(ev.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
