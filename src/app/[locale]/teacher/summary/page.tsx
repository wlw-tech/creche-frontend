"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TeacherSummary() {
  const [summaryData] = useState({
    date: new Date().toLocaleDateString("fr-FR"),
    class: "Salle Bleue",
    totalChildren: 28,
    present: 28,
    absent: 0,
  })

  const [appetiteStats] = useState({ "un peu": 3, bien: 20, tout: 5 })
  const [moodStats] = useState({ mauvaise: 1, bonne: 22, excellente: 5 })
  const [participationStats] = useState({ faible: 2, bonne: 20, excellente: 6 })

  const avgNap = "1h15"
  const presentCount = summaryData.present

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-6 lg:px-0 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Résumé de la journée</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            {summaryData.class} • {summaryData.date}
          </p>
        </div>
        <Link href="/teacher">
          <Button variant="outline" className="rounded-lg bg-transparent border border-gray-300 font-medium text-sm">
            ← Retour
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-sky-50 to-sky-100 shadow-sm">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 uppercase">Présents</p>
              <p className="text-4xl font-bold text-sky-700 mt-2">{summaryData.present}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-sm">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 uppercase">Taux présence</p>
              <p className="text-4xl font-bold text-green-700 mt-2">
                {Math.round((summaryData.present / summaryData.totalChildren) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-sm">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600 uppercase">Sieste moyenne</p>
              <p className="text-4xl font-bold text-purple-700 mt-2">{avgNap}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appetite */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-transparent pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span>🍽️</span> Appétit
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {Object.entries(appetiteStats).map(([label, count]) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{label}</span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(count / presentCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mood */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-transparent pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span>😊</span> Humeur
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {Object.entries(moodStats).map(([label, count]) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{label}</span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(count / presentCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Participation */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-transparent pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span>⭐</span> Participation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {Object.entries(participationStats).map(([label, count]) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{label}</span>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(count / presentCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Daily Message */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-transparent pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span>📝</span> Message de la journée
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <textarea
              placeholder="Résumez la journée pour les parents..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-transparent resize-none"
              rows={3}
              defaultValue="Aujourd'hui, les enfants ont travaillé la motricité fine et les mathématiques. Excellente participation et bonne ambiance!"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-lg border border-gray-300 font-medium text-sm bg-transparent"
              >
                Enregistrer
              </Button>
              <Button className="rounded-lg bg-sky-500 text-white hover:bg-sky-600 font-semibold text-sm px-6">
                Envoyer à tous
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <Link href="/teacher">
          <Button className="rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 font-semibold px-8 py-3">
            Terminer la journée
          </Button>
        </Link>
      </div>
    </div>
  )
}
