"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, X, Edit2, Trash2, Eye } from "lucide-react";
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

const parseLocalDate = (iso: string): Date => {
  const d = iso.slice(0, 10);
  const [y, mo, day] = d.split("-").map(Number);
  return new Date(y, mo - 1, day);
};

const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const DAYS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MONTHS_FR = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

type FormData = {
  collationMatin: string;
  repas: string;
  gouter: string;
  allergenes: string;
};

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("view");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ collationMatin: "", repas: "", gouter: "", allergenes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.listMenus(1, 200);
      const items = response.data?.data ?? response.data?.items ?? [];
      setMenus(items);
    } catch {
      setError("Erreur lors du chargement des menus.");
    } finally {
      setLoading(false);
    }
  };

  const weekDays = getWeekDays(weekStart);
  const menuMap = new Map<string, MenuItem>();
  menus.forEach((m) => menuMap.set(toDateKey(parseLocalDate(m.date)), m));

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };
  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };
  const goToday = () => setWeekStart(getWeekStart(new Date()));

  const openCreate = (day: Date) => {
    setSelectedDay(day);
    setEditingId(null);
    setFormData({ collationMatin: "", repas: "", gouter: "", allergenes: "" });
    setModalMode("create");
    setError(null);
  };

  const openEdit = (menu: MenuItem) => {
    setSelectedDay(parseLocalDate(menu.date));
    setEditingId(menu.id);
    setFormData({
      collationMatin: menu.collationMatin ?? "",
      repas: menu.repas ?? "",
      gouter: menu.gouter ?? "",
      allergenes: menu.allergenes.join(", "),
    });
    setModalMode("edit");
    setError(null);
  };

  const openView = (day: Date) => {
    setSelectedDay(day);
    setModalMode("view");
    setError(null);
  };

  const closeModal = () => {
    setSelectedDay(null);
    setEditingId(null);
    setError(null);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selectedDay) return;
    const allergenesArr = formData.allergenes.split(",").map((a) => a.trim()).filter(Boolean);
    try {
      setSaving(true);
      setError(null);
      if (modalMode === "edit" && editingId) {
        await apiClient.updateMenu(editingId, {
          collationMatin: formData.collationMatin,
          repas: formData.repas,
          gouter: formData.gouter,
          allergenes: allergenesArr,
        });
      } else {
        await apiClient.createMenu({
          date: toDateKey(selectedDay),
          collationMatin: formData.collationMatin,
          repas: formData.repas,
          gouter: formData.gouter,
          allergenes: allergenesArr,
        });
      }
      await fetchMenus();
      closeModal();
    } catch {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await apiClient.publishMenu(id);
      await fetchMenus();
    } catch {
      setError("Erreur lors de la publication.");
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce menu ?")) return;
    try {
      await apiClient.deleteMenu(id);
      await fetchMenus();
      closeModal();
    } catch {
      setError("Impossible de supprimer un menu publie.");
    }
  };

  const today = toDateKey(new Date());

  const weekLabel = (() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 4);
    const sDay = weekStart.getDate();
    const eDay = end.getDate();
    const sMo = MONTHS_FR[weekStart.getMonth()];
    const eMo = MONTHS_FR[end.getMonth()];
    const yr = end.getFullYear();
    if (weekStart.getMonth() === end.getMonth()) return `${sDay} - ${eDay} ${sMo} ${yr}`;
    return `${sDay} ${sMo} - ${eDay} ${eMo} ${yr}`;
  })();

  const selectedMenu = selectedDay ? menuMap.get(toDateKey(selectedDay)) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu enfant</h1>
          <p className="text-muted-foreground mt-1">Planification des repas de la semaine</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday} className="text-xs px-3">
            Aujourd'hui
          </Button>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-3 bg-destructive/10 border-destructive/30">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}

      {/* Week label */}
      <p className="text-sm font-medium text-muted-foreground">{weekLabel}</p>

      {/* Weekly calendar grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {weekDays.map((day) => {
            const key = toDateKey(day);
            const menu = menuMap.get(key);
            const isToday = key === today;
            const dayName = DAYS_FR[day.getDay() === 0 ? 6 : day.getDay() - 1];
            return (
              <Card
                key={key}
                className={`p-0 overflow-hidden flex flex-col border-2 transition-colors ${
                  isToday ? "border-primary/60" : "border-border/50 hover:border-primary/30"
                }`}
              >
                {/* Day header */}
                <div className={`px-3 py-2 flex items-center justify-between ${isToday ? "bg-primary/10" : "bg-muted/30"}`}>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wide ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                      {dayName}
                    </p>
                    <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                      {day.getDate()}
                    </p>
                  </div>
                  {menu ? (
                    <Badge className={menu.statut === "Publie" ? "bg-green-100 text-green-700 border-green-300 text-xs" : "bg-amber-100 text-amber-700 border-amber-300 text-xs"}>
                      {menu.statut === "Publie" ? "Publie" : "Brouillon"}
                    </Badge>
                  ) : null}
                </div>

                {/* Menu content */}
                <div className="p-3 flex-1 space-y-2 min-h-[120px]">
                  {menu ? (
                    <>
                      {menu.collationMatin && (
                        <div>
                          <p className="text-[10px] font-bold text-blue-600 uppercase">Matin</p>
                          <p className="text-xs text-foreground truncate">{menu.collationMatin}</p>
                        </div>
                      )}
                      {menu.repas && (
                        <div>
                          <p className="text-[10px] font-bold text-orange-600 uppercase">Repas</p>
                          <p className="text-xs text-foreground truncate">{menu.repas}</p>
                        </div>
                      )}
                      {menu.gouter && (
                        <div>
                          <p className="text-[10px] font-bold text-red-600 uppercase">Gouter</p>
                          <p className="text-xs text-foreground truncate">{menu.gouter}</p>
                        </div>
                      )}
                      {menu.allergenes.length > 0 && (
                        <p className="text-[10px] text-red-500">Allergenes: {menu.allergenes.join(", ")}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground italic mt-2">Aucun menu</p>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t px-3 py-2 flex gap-1 justify-end bg-muted/10">
                  {menu ? (
                    <>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openView(day)} title="Voir">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(menu)} title="Modifier" disabled={menu.statut === "Publie"}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(menu.id)} title="Supprimer">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => openCreate(day)}>
                      <Plus className="w-3 h-3" /> Ajouter
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Day modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">
                  {DAYS_FR[selectedDay.getDay() === 0 ? 6 : selectedDay.getDay() - 1]}
                </p>
                <h2 className="text-lg font-bold">
                  {selectedDay.getDate()} {MONTHS_FR[selectedDay.getMonth()]} {selectedDay.getFullYear()}
                </h2>
              </div>
              <button onClick={closeModal} className="p-1 rounded hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* View mode */}
              {modalMode === "view" && selectedMenu && (
                <>
                  <div className="flex items-center justify-between">
                    <Badge className={selectedMenu.statut === "Publie" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                      {selectedMenu.statut === "Publie" ? "Publie" : "Brouillon"}
                    </Badge>
                    <div className="flex gap-2">
                      {selectedMenu.statut !== "Publie" && (
                        <Button size="sm" variant="outline" onClick={() => handlePublish(selectedMenu.id)} className="text-green-600 border-green-300 hover:bg-green-50 text-xs">
                          Publier
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openEdit(selectedMenu)} className="gap-1 text-xs">
                          <Edit2 className="w-3 h-3" /> Modifier
                        </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                      <p className="text-xs font-bold text-blue-700 uppercase mb-1">Collation du matin</p>
                      <p className="text-sm text-blue-900">{selectedMenu.collationMatin || "—"}</p>
                    </div>
                    <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                      <p className="text-xs font-bold text-orange-700 uppercase mb-1">Repas (dejeuner)</p>
                      <p className="text-sm text-orange-900">{selectedMenu.repas || "—"}</p>
                    </div>
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                      <p className="text-xs font-bold text-red-700 uppercase mb-1">Gouter</p>
                      <p className="text-sm text-red-900">{selectedMenu.gouter || "—"}</p>
                    </div>
                  </div>
                  {selectedMenu.allergenes.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs font-bold text-red-700 uppercase mb-2">Allergenes detectes</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedMenu.allergenes.map((a) => (
                          <Badge key={a} className="bg-red-600 text-white text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selectedMenu.id)}
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Supprimer ce menu
                    </Button>
                </>
              )}

              {/* Edit / Create mode */}
              {(modalMode === "edit" || modalMode === "create") && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Collation du matin</label>
                    <Input name="collationMatin" value={formData.collationMatin} onChange={handleInput} placeholder="Ex: Yaourt, fruits frais" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Repas (dejeuner)</label>
                    <Input name="repas" value={formData.repas} onChange={handleInput} placeholder="Ex: Poulet roti, riz" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gouter</label>
                    <Input name="gouter" value={formData.gouter} onChange={handleInput} placeholder="Ex: Compote, lait" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Allergenes</label>
                    <Textarea name="allergenes" value={formData.allergenes} onChange={handleInput} placeholder="Arachides, Gluten, Lait (separes par virgule)" className="resize-none" rows={2} />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      {saving ? "Enregistrement..." : modalMode === "edit" ? "Mettre a jour" : "Creer le menu"}
                    </Button>
                    <Button variant="outline" onClick={closeModal} disabled={saving}>
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
