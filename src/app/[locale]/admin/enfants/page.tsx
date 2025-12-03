"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Locale } from "@/lib/i18n/config";
import { SidebarNew } from "@/components/layout/sidebar-new";
import { apiClient } from "@/lib/api";

type EnfantItem = {
  id: string;
  name: string;
  group: string;
  classId?: string;
  teacher: string;
  parent: string;
  status: string;
  statusCode?: string;
};

export default function EnfantsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const currentLocale = resolvedParams.locale;
  const t = useTranslations('admin.children');
  const [search, setSearch] = useState("");
  const [children, setChildren] = useState<EnfantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<{ id: string; nom: string }[]>([]);
  const [families, setFamilies] = useState<{ id: string; emailPrincipal: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    familleId: "",
    dateNaissance: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchChildren() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiClient.listChildren(1, 50);
        const items = res.data.items ?? [];

        const mapped: EnfantItem[] = items.map((enfant: any) => {
          const fullName = `${enfant.prenom} ${enfant.nom}`.trim();
          const group = enfant.classe?.nom ?? "—";
          const tuteurs = enfant.famille?.tuteurs ?? [];
          const principal = tuteurs.find((t: any) => t.principal) ?? tuteurs[0];
          const parentName = principal
            ? `${principal.prenom ?? ""} ${principal.nom ?? ""}`.trim() || principal.telephone || "—"
            : "—";

          let status = "—";
          let statusCode: string | undefined = undefined;
          const presence = enfant.presences && enfant.presences[0];
          if (presence?.statut === "Present") {
            status = "Présent";
            statusCode = "Present";
          } else if (presence?.statut === "Absent") {
            status = "Absent";
            statusCode = "Absent";
          } else if (presence?.statut === "Justifie") {
            status = "Justifié";
            statusCode = "Justifie";
          }

          return {
            id: enfant.id,
            name: fullName,
            group,
            classId: enfant.classe?.id,
            teacher: "—",
            parent: parentName,
            status,
            statusCode,
          } as EnfantItem;
        });

        if (!cancelled) {
          setChildren(mapped);
        }
      } catch (err) {
        console.error("[Admin/Enfants] Error loading children", err);
        if (!cancelled) {
          setError("Impossible de charger les enfants.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchChildren();

    // Charger les classes pour le select de groupe
    async function fetchClasses() {
      try {
        const res = await apiClient.listClasses();
        setClasses(res.data ?? []);
      } catch (err) {
        console.error("[Admin/Enfants] Error loading classes", err);
      }
    }

    fetchClasses();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChangeClass = async (id: string, classId: string) => {
    try {
      await apiClient.updateChild(id, {
        classe: classId ? { connect: { id: classId } } : { disconnect: true },
      });
      setChildren((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                classId,
                group: classes.find((cl) => cl.id === classId)?.nom ?? "—",
              }
            : c,
        ),
      );
    } catch (err) {
      console.error("[Admin/Enfants] Error updating class", err);
      alert("Erreur lors de la mise à jour de la classe.");
    }
  };

  const handleChangeStatus = async (id: string, statut: string) => {
    try {
      await apiClient.updateChildStatus(id, statut);
      setChildren((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          let statusLabel = "—";
          if (statut === "Present") statusLabel = "Présent";
          else if (statut === "Absent") statusLabel = "Absent";
          else if (statut === "Justifie") statusLabel = "Justifié";
          return { ...c, statusCode: statut, status: statusLabel };
        }),
      );
    } catch (err) {
      console.error("[Admin/Enfants] Error updating status", err);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.familleId || !formData.dateNaissance) {
        alert("Veuillez choisir une famille et une date de naissance.");
        return;
      }

      await apiClient.createChild({
        prenom: formData.prenom,
        nom: formData.nom,
        famille: {
          connect: { id: formData.familleId },
        },
        dateNaissance: new Date(formData.dateNaissance).toISOString(),
      });

      // Après création/mise à jour, on recharge la liste
      const res = await apiClient.listChildren(1, 50);
      const items = res.data.items ?? [];
      const mapped: EnfantItem[] = items.map((enfant: any) => {
        const fullName = `${enfant.prenom} ${enfant.nom}`.trim();
        const group = enfant.classe?.nom ?? "—";
        const tuteurs = enfant.famille?.tuteurs ?? [];
        const principal = tuteurs.find((t: any) => t.principal) ?? tuteurs[0];
        const parentName = principal
          ? `${principal.prenom ?? ""} ${principal.nom ?? ""}`.trim() || principal.telephone || "—"
          : "—";

        let status = "—";
        const presence = enfant.presences && enfant.presences[0];
        if (presence?.statut === "Present") status = "Présent";
        else if (presence?.statut === "Absent") status = "Absent";
        else if (presence?.statut === "Justifie") status = "Justifié";

        return {
          id: enfant.id,
          name: fullName,
          group,
          teacher: "—",
          parent: parentName,
          status,
        } as EnfantItem;
      });
      setChildren(mapped);

      setFormData({ prenom: "", nom: "", familleId: "", dateNaissance: "" });
      setModalOpen(false);
    } catch (err) {
      console.error("[Admin/Enfants] Error saving child", err);
      alert("Erreur lors de l'enregistrement de l'enfant.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet enfant ?")) return;

    try {
      await apiClient.deleteChild(id);
      setChildren((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("[Admin/Enfants] Error deleting child", err);
      alert("Erreur lors de la suppression de l'enfant.");
    }
  };

  const filtered = children.filter((child) =>
    child.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SidebarNew currentLocale={currentLocale} />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{t('title')}</h1>
              <p className="text-muted-foreground">
                {loading
                  ? 'Chargement…'
                  : `${children.length} enfant${children.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <Button
              onClick={async () => {
                try {
                  const res = await apiClient.listChildFamilies();
                  setFamilies(res.data ?? []);
                  setModalOpen(true);
                } catch (err) {
                  console.error('[Admin/Enfants] Error loading families', err);
                  alert('Impossible de charger les familles.');
                }
              }}
            >
              Ajouter un enfant
            </Button>
          </div>

          <Card className="p-6">
            {error && (
              <p className="mb-4 text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {t('filter')}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left font-semibold text-foreground">{t('name')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">{t('group')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">{t('teacher')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">{t('parent')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">{t('status')}</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-muted-foreground">
                        Chargement des enfants…
                      </td>
                    </tr>
                  ) : filtered.length > 0 ? (
                    filtered.map((child) => (
                      <tr
                        key={child.id}
                        className="border-b border-border hover:bg-muted/50"
                      >
                        <td className="px-6 py-3 font-medium">{child.name}</td>
                        <td className="px-6 py-3 text-muted-foreground">
                          <select
                            value={child.classId ?? ""}
                            onChange={(e) => handleChangeClass(child.id, e.target.value)}
                            className="border border-input rounded-md px-2 py-1 text-xs bg-background"
                          >
                            <option value="">—</option>
                            {classes.map((cl) => (
                              <option key={cl.id} value={cl.id}>
                                {cl.nom}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{child.teacher}</td>
                        <td className="px-6 py-3 text-muted-foreground text-xs">{child.parent}</td>
                        <td className="px-6 py-3">
                          <select
                            value={child.statusCode ?? ""}
                            onChange={(e) => handleChangeStatus(child.id, e.target.value)}
                            className="border border-input rounded-md px-2 py-1 text-xs bg-background mb-1"
                          >
                            <option value="">—</option>
                            <option value="Present">Présent</option>
                            <option value="Absent">Absent</option>
                            <option value="Justifie">Justifié</option>
                          </select>
                          <Badge
                            className={
                              child.status === "Présent"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {child.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 flex gap-2 justify-end">
                          <Link
                            href={`/${currentLocale}/admin/enfants/${child.id}`}
                            className="inline-flex items-center gap-2 px-3 py-1 border rounded text-xs hover:bg-muted"
                          >
                            <Eye className="w-4 h-4" />
                            {t('viewProfile')}
                          </Link>
                          <Button
                            size="icon"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(child.id)}
                            aria-label={t('delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-6 text-center text-muted-foreground">
                        Aucun enfant ne correspond à votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal ajout enfant */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Ajouter un enfant</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom</label>
                  <Input
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <Input
                    name="nom"
                    value={formData.nom}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Famille</label>
                <select
                  name="familleId"
                  value={formData.familleId}
                  onChange={handleFormChange}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  required
                >
                  <option value="">Sélectionner une famille</option>
                  {families.map((fam) => (
                    <option key={fam.id} value={fam.id}>
                      {fam.emailPrincipal}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date de naissance</label>
                <Input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setModalOpen(false);
                    setFormData({ prenom: "", nom: "", familleId: "", dateNaissance: "" });
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
