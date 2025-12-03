"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [child] = useState({
    id: 1,
    name: "Laila T.",
    class: "Petite Section",
    age: "3 ans",
    avatar: "👧",
    status: "Présente",
    allergies: ["Arachides"],
  })

  const [dailyReport, setDailyReport] = useState({
    appetite: "Bien",
    mood: "Bonne",
    nap: "2h",
    participation: "Bonne",
  })

  const upcomingEvents = [
    {
      id: 1,
      date: "30 SEP",
      title: "Réunion parents-enseignants",
      time: "14:00 – 16:00",
    },
    {
      id: 2,
      date: "05 OCT",
      title: "Sortie au parc",
      time: "09:00 – 12:00",
    },
  ]

  const milestones = [
    { name: "Social", status: "En cours", date: "27/09/2025" },
    { name: "Language", status: "En cours", date: "27/09/2025" },
    { name: "Préhension", status: "En cours", date: "27/09/2025" },
    { name: "Motricité fine 4", status: "En cours", date: "27/09/2025" },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Child Header Card */}
      <Card className="border-0 bg-gradient-to-r from-sky-100 to-sky-50 shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-200 text-4xl shadow-sm">
                {child.avatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{child.name}</h2>
                <p className="text-sm text-gray-600">
                  {child.class} • {child.age}
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-sm font-semibold text-white">
                    <span>✓</span> {child.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase">Classe</p>
              <p className="text-lg font-bold text-gray-900">{child.class}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-sky-100 to-sky-50 p-1 rounded-lg">
          <TabsTrigger value="overview" className="rounded text-sm font-medium">
            👁️ Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="progression" className="rounded text-sm font-medium">
            📈 Progression
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded text-sm font-medium">
            💳 Facturation
          </TabsTrigger>
          <TabsTrigger value="profile" className="rounded text-sm font-medium">
            👤 Profil
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Daily Appetite */}
          <Card className="border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span>🍽️</span> Appétit
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full text-sm bg-transparent">
                  Un peu
                </Button>
                <Button className="rounded-full bg-green-500 text-sm text-white hover:bg-green-600">Bien</Button>
                <Button variant="outline" className="rounded-full text-sm bg-transparent">
                  Tout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Daily Summary */}
          <Card className="border border-sky-100 shadow-sm">
            <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Résumé de la journée</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed text-gray-600">
                Aujourd'hui, les enfants ont participé à des activités de motricité fine et de dessin collectif. Très
                bon moment d'apprentissage !
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border border-sky-100 shadow-sm">
            <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Événements à venir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 rounded-lg bg-green-50 p-4 border border-green-100"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-500 font-bold text-white text-sm flex-shrink-0">
                    {event.date}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progression Tab */}
        <TabsContent value="progression" className="space-y-6">
          <Card className="border border-sky-100 shadow-sm">
            <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span>📈</span> Progression — Jalons éducatifs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {milestones.map((milestone) => (
                  <div
                    key={milestone.name}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{milestone.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-sky-200 px-3 py-1 text-xs font-semibold text-sky-700">
                        {milestone.status}
                      </span>
                      <span className="text-xs text-gray-500">{milestone.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facturation Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Facturation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Aucune facture en attente.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profil Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Child Information */}
            <Card className="border border-sky-100 shadow-sm">
              <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <span>ℹ️</span> Informations de l'enfant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-200 text-3xl shadow-sm">
                    {child.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{child.name}</p>
                    <p className="text-sm text-gray-600">
                      {child.class} – {child.age}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase">Date de naissance</p>
                  <p className="font-semibold text-gray-900">15 Mars 2022</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase">Allergies</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {child.allergies.map((allergy) => (
                      <span
                        key={allergy}
                        className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authorized Persons */}
            <Card className="border border-sky-100 shadow-sm">
              <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <span>👥</span> Personnes autorisées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {[
                  { name: "Mme. Parent", role: "Mère", phone: "06 12 34 56 78" },
                  { name: "M. Parent", role: "Père", phone: "06 98 76 54 32" },
                  { name: "Mme. Grand-mère", role: "Grand-mère", phone: "06 11 22 33 44" },
                ].map((person) => (
                  <div key={person.phone} className="rounded-lg bg-sky-50 p-3 border border-sky-100">
                    <p className="font-semibold text-gray-900">{person.name}</p>
                    <p className="text-xs text-gray-600">{person.role}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{person.phone}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
