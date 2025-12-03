"use client";

import { useState, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Locale } from "@/lib/i18n/config";
import { SidebarNew } from "@/components/layout/sidebar-new";

const inscriptionsData = [
  {
    id: 1,
    childName: "Amin El Fassi",
    age: "2 ans",
    allergies: "Aucune",
    parentName: "M. El Fassi",
    group: "Éveil",
    email: "elfassi@email.com",
    phone: "0612345678",
    status: "En revue",
  },
  {
    id: 2,
    childName: "Lina Tazi",
    age: "3 ans",
    allergies: "Arachides",
    parentName: "Mme. Tazi",
    group: "Petite section",
    email: "tazi@email.com",
    phone: "0623456789",
    status: "Accepté",
  },
  {
    id: 3,
    childName: "Omar Benjaloum",
    age: "4 ans",
    allergies: "Lactose",
    parentName: "M. Benjaloum",
    group: "Moyenne section",
    email: "benjaloum@email.com",
    phone: "0634567890",
    status: "Attente",
  },
  {
    id: 4,
    childName: "Sara I.",
    age: "3 ans",
    allergies: "Aucune",
    parentName: "Mme. Idrissi",
    group: "Petite section",
    email: "idrissi@email.com",
    phone: "0645678901",
    status: "Refusé",
  },
]

export default function InscriptionsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params);
  const currentLocale = resolvedParams.locale;
  const t = useTranslations('admin.inscriptions');
  const [search, setSearch] = useState("");

  const filtered = inscriptionsData.filter((insc) => insc.childName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SidebarNew currentLocale={currentLocale} />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{inscriptionsData.length} inscriptions</p>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((insc) => (
              <Card key={insc.id} className="p-6 border-2 border-border/50">
                <div className="mb-4 pb-4 border-b border-border">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{insc.childName}</h3>
                      <p className="text-sm text-muted-foreground">{insc.age}</p>
                    </div>
                    <Badge
                      className={
                        insc.status === "Accepté"
                          ? "bg-green-100 text-green-700"
                          : insc.status === "En revue"
                          ? "bg-yellow-100 text-yellow-700"
                          : insc.status === "Attente"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {insc.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('parent')}:</span>
                    <span className="font-medium">{insc.parentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('group')}:</span>
                    <span className="font-medium">{insc.group}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('allergies')}:</span>
                    <span className="font-medium">{insc.allergies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('contact')}:</span>
                    <span className="font-medium">{insc.phone}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Eye className="w-4 h-4" />
                    {t('viewDetails')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
                                
