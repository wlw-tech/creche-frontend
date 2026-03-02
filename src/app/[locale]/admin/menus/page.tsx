"use client";

import type React from "react";
import { useState, useEffect, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Edit2, Trash2, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { Locale } from "@/lib/i18n/config";

// ─── types ────────────────────────────────────────────────────────────────────
interface DayMenu {
  id?: string | null;
  collationMatin: string;
  repas: string;
  gouter: string;
  statut?: "Brouillon" | "Publie";
}

// ISO YYYY-MM-DD → DayMenu
type WeekData = Record<string, DayMenu>;

// ─── constants ────────────────────────────────────────────────────────────────
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"] as const;
type Jour = (typeof JOURS)[number];

const ROWS: { key: keyof DayMenu; label: string; color: string }[] = [
  { key: "collationMatin", label: "🍎 Collation du matin", color: "bg-orange-50 text-orange-800 border-orange-200" },
  { key: "repas",          label: "🍽️ Repas (déjeuner)",   color: "bg-green-50 text-green-800 border-green-200" },
  { key: "gouter",         label: "🧃 Goûter",             color: "bg-purple-50 text-purple-800 border-purple-200" },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const toISO = (d: Date) => d.toISOString().slice(0, 10);

/** Returns the Monday ISO date of the week that contains `date` */
const getMondayOf = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - day);
  return d;
};

/** Returns array of 5 ISO dates Mon-Fri for the week starting at `monday` */
const getWeekDates = (monday: Date): string[] =>
  Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toISO(d);
  });

const formatWeekLabel = (monday: Date) => {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return `${monday.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} – ${friday.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`;
};

const empty = (): DayMenu => ({ collationMatin: "", repas: "", gouter: "" });

// ─── component ────────────────────────────────────────────────────────────────
export default function MenusPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const currentLocale = resolvedParams.locale;

  // current week (monday)
  const [monday, setMonday] = useState<Date>(() => getMondayOf(new Date()));
  // all menus from API, keyed by ISO date
  const [allMenus, setAllMenus] = useState<WeekData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // editing state: per-cell inline editing
  const [editing, setEditing] = useState<{ date: string; field: keyof DayMenu } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.listMenus(1, 200);
      const rawItems: any[] = response.data?.data ?? response.data?.items ?? [];

      const mapped: WeekData = {};
      rawItems.forEach((menu: any) => {
        const iso = menu.date?.slice(0, 10);
        if (iso) {
          mapped[iso] = {
            id: menu.id,
            collationMatin: menu.collationMatin ?? "",
            repas: menu.repas ?? "",
            gouter: menu.gouter ?? "",
            statut: menu.statut,
          };
        }
      });
      setAllMenus(mapped);
    } catch (err) {
      console.error("[Menus] fetch error", err);
      setError("Erreur lors du chargement des menus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenus(); }, []);

  // ── navigation ─────────────────────────────────────────────────────────────
  const prevWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() - 7);
    setMonday(d);
  };
  const nextWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7);
    setMonday(d);
  };
  const goToday = () => setMonday(getMondayOf(new Date()));

  // ── editing ────────────────────────────────────────────────────────────────
  const startEdit = (date: string, field: keyof DayMenu) => {
    if (allMenus[date]?.statut === "Publie") return;
    setEditing({ date, field });
    setEditValue((allMenus[date]?.[field] as string) ?? "");
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    const { date, field } = editing;
    const existing = allMenus[date];

    setSaving(true);
    try {
      const payload = { [field === "collationMatin" ? "collationMatin" : field === "repas" ? "repas" : "gouter"]: editValue || undefined };
      let saved: any;
      if (existing?.id) {
        const res = await apiClient.updateMenu(existing.id, payload as any);
        saved = res.data;
      } else {
        const createPayload: any = { date, collationMatin: undefined, repas: undefined, gouter: undefined };
        createPayload[field] = editValue || undefined;
        const res = await apiClient.createMenu(createPayload);
        saved = res.data;
      }

      setAllMenus((prev) => ({
        ...prev,
        [date]: {
          id: saved?.id ?? existing?.id,
          collationMatin: saved?.collationMatin ?? existing?.collationMatin ?? "",
          repas: saved?.repas ?? existing?.repas ?? "",
          gouter: saved?.gouter ?? existing?.gouter ?? "",
          statut: saved?.statut ?? existing?.statut,
        },
      }));
      setEditing(null);
    } catch (err) {
      console.error("[Menus] save error", err);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (date: string) => {
    const menu = allMenus[date];
    if (!menu?.id || menu.statut === "Publie") return;
    try {
      await apiClient.publishMenu(menu.id);
      setAllMenus((prev) => ({
        ...prev,
        [date]: { ...prev[date], statut: "Publie" },
      }));
    } catch (err) {
      alert("Erreur lors de la publication.");
    }
  };

  const handleDelete = async (date: string) => {
    const menu = allMenus[date];
    if (!menu?.id) return;
    if (menu.statut === "Publie") { alert("Impossible de supprimer un menu publié."); return; }
    if (!confirm("Supprimer le menu de ce jour ?")) return;
    try {
      await apiClient.deleteMenu(menu.id);
      setAllMenus((prev) => {
        const next = { ...prev };
        delete next[date];
        return next;
      });
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  // ── weekly data ────────────────────────────────────────────────────────────
  const weekDates = getWeekDates(monday);

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarNew currentLocale={currentLocale} />

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Menus de la semaine</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Cliquez sur une cellule pour modifier son contenu.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-foreground min-w-[200px] text-center">
                {formatWeekLabel(monday)}
              </span>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToday}>
                Aujourd'hui
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement des menus...</p>
          ) : (
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border">
                      {/* Category column header */}
                      <th className="px-4 py-3 text-left font-semibold text-foreground w-44 border-r border-border">
                        Catégorie
                      </th>
                      {weekDates.map((iso, idx) => {
                        const d = new Date(iso);
                        const isToday = toISO(new Date()) === iso;
                        const menu = allMenus[iso];
                        return (
                          <th key={iso} className={`px-3 py-3 text-center font-semibold min-w-[140px] border-r border-border last:border-r-0 ${isToday ? "bg-primary/5" : ""}`}>
                            <div className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                              {JOURS[idx]}
                            </div>
                            <div className="text-xs text-muted-foreground font-normal">
                              {d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                            </div>
                            {/* Publish/Delete actions */}
                            {menu?.id && (
                              <div className="flex justify-center gap-1 mt-1">
                                {menu.statut === "Publie" ? (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200">
                                    Publié
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handlePublish(iso)}
                                      className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200 hover:bg-amber-200 transition-colors"
                                    >
                                      Publier
                                    </button>
                                    <button
                                      onClick={() => handleDelete(iso)}
                                      className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full border border-red-200 hover:bg-red-200 transition-colors"
                                    >
                                      ✕
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row, rowIdx) => (
                      <tr key={row.key} className={`border-b border-border last:border-b-0 ${rowIdx % 2 === 0 ? "bg-white" : "bg-muted/20"}`}>
                        {/* Category label */}
                        <td className={`px-4 py-3 font-semibold text-sm border-r border-border ${row.color}`}>
                          {row.label}
                        </td>
                        {/* Day cells */}
                        {weekDates.map((iso) => {
                          const menu = allMenus[iso];
                          const value = (menu?.[row.key] as string) || "";
                          const isEditing = editing?.date === iso && editing?.field === row.key;
                          const isPublished = menu?.statut === "Publie";

                          return (
                            <td
                              key={iso}
                              className={`px-3 py-3 border-r border-border last:border-r-0 align-top min-w-[140px] ${
                                isPublished ? "bg-emerald-50/30" : ""
                              }`}
                            >
                              {isEditing ? (
                                <div className="space-y-1">
                                  <Input
                                    autoFocus
                                    className="h-8 text-xs"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveEdit();
                                      if (e.key === "Escape") cancelEdit();
                                    }}
                                    placeholder="Saisir..."
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={saveEdit}
                                      disabled={saving}
                                      className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded hover:opacity-90"
                                    >
                                      {saving ? "..." : "✓"}
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded hover:bg-gray-300"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  className={`w-full text-left text-xs rounded-md p-1.5 min-h-[32px] transition-colors ${
                                    isPublished
                                      ? "cursor-default text-foreground/80"
                                      : "hover:bg-primary/8 cursor-pointer group"
                                  }`}
                                  onClick={() => !isPublished && startEdit(iso, row.key)}
                                  disabled={isPublished}
                                  title={isPublished ? "Menu publié — non modifiable" : "Cliquer pour modifier"}
                                >
                                  {value ? (
                                    <span>{value}</span>
                                  ) : (
                                    <span className={`text-muted-foreground/50 ${!isPublished ? "group-hover:text-muted-foreground/80" : ""}`}>
                                      —
                                    </span>
                                  )}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="px-4 py-3 bg-muted/30 border-t border-border text-xs text-muted-foreground flex flex-wrap gap-4">
                <span>💡 Cliquez sur une cellule vide ou remplie pour modifier le contenu.</span>
                <span>• Entrée = valider | Echap = annuler</span>
                <span>• Publiez un jour une fois le menu finalisé (visible par les parents).</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
