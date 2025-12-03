"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TeacherDashboard() {
  const [currentChildIndex, setCurrentChildIndex] = useState(0)
  const [attendanceData, setAttendanceData] = useState({})
  const [dailySummaryData, setDailySummaryData] = useState({})

  // Mock data - will connect to API
  const children = [
    {
      id: 1,
      name: "Laila T.",
      age: "4 ans",
      class: "Salle Bleue",
      allergies: ["Arachides"],
      educationalMilestones: [
        { milestone: "Social", status: "En cours", date: "27/09/2025" },
        { milestone: "Langage", status: "En cours", date: "27/09/2025" },
        { milestone: "Préhension", status: "En cours", date: "27/09/2025" },
        { milestone: "Motricité fine 4", status: "En cours", date: "27/09/2025" },
      ],
    },
    {
      id: 2,
      name: "Youssef M.",
      age: "3 ans",
      class: "Salle Bleue",
      allergies: [],
      educationalMilestones: [
        { milestone: "Social", status: "Complété", date: "25/09/2025" },
        { milestone: "Langage", status: "En cours", date: "27/09/2025" },
        { milestone: "Préhension", status: "En cours", date: "27/09/2025" },
        { milestone: "Motricité fine 3", status: "En cours", date: "27/09/2025" },
      ],
    },
    {
      id: 3,
      name: "Nour K.",
      age: "3 ans",
      class: "Salle Bleue",
      allergies: ["Noix"],
      educationalMilestones: [
        { milestone: "Social", status: "En cours", date: "27/09/2025" },
        { milestone: "Langage", status: "En cours", date: "27/09/2025" },
        { milestone: "Préhension", status: "En cours", date: "27/09/2025" },
        { milestone: "Motricité fine 3", status: "En cours", date: "27/09/2025" },
      ],
    },
  ]

  const currentChild = children[currentChildIndex]

  const handlePresence = (presence: "present" | "absent") => {
    setAttendanceData({
      ...attendanceData,
      [currentChild.id]: presence,
    })
    handleNext()
  }

  const handleDailySummary = (summary: string) => {
    setDailySummaryData({
      ...dailySummaryData,
      [currentChild.id]: summary,
    })
    handleNext()
  }

  const handleNext = () => {
    if (currentChildIndex < children.length - 1) {
      setCurrentChildIndex(currentChildIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentChildIndex > 0) {
      setCurrentChildIndex(currentChildIndex - 1)
    }
  }

  const isAllProcessed = children.length > 0 && currentChildIndex === children.length - 1

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Enseignant</h1>
          <p className="text-gray-600 mt-1">Salle Bleue</p>
        </div>
        <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-6 py-2 font-semibold">FR / AR</Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Child Card & Attendance */}
        <div className="space-y-4">
          <Card className="border-2 border-gray-200 shadow-md">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Child Avatar & Info */}
                <div className="flex items-start gap-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {currentChild.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{currentChild.name}</h2>
                    <p className="text-sm text-gray-600">
                      {currentChild.age} • {currentChild.class}
                    </p>
                    {currentChild.allergies.length > 0 && (
                      <p className="text-xs font-bold text-red-600 mt-2">
                        Allergie: {currentChild.allergies.join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Presence Buttons */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Présence du 29/09 — 08:35</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handlePresence("present")}
                      className="flex-1 bg-green-400 hover:bg-green-500 text-white font-bold rounded-lg py-2"
                    >
                      ✓ Présent
                    </Button>
                    <Button
                      onClick={() => handlePresence("absent")}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg py-2"
                    >
                      ✕ Absent
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Educational Milestones */}
        <div>
          <Card className="border-2 border-gray-200 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Progression — Jalons éducatifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentChild.educationalMilestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="font-medium text-gray-900 text-sm">{milestone.milestone}</span>
                    <div className="flex items-center gap-3">
                      <span className="bg-sky-300 text-gray-900 text-xs font-bold px-3 py-1 rounded-lg">
                        {milestone.status}
                      </span>
                      <span className="text-xs text-gray-600">{milestone.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Daily Summary Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé de journée</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-gray-200">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">🍽️</div>
              <div className="font-bold text-gray-900">Appétit</div>
              <p className="text-green-600 font-semibold text-sm mt-2">Bien</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">😊</div>
              <div className="font-bold text-gray-900">Humeur</div>
              <p className="text-sky-400 font-semibold text-sm mt-2">Bonne</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">😴</div>
              <div className="font-bold text-gray-900">Sieste</div>
              <p className="text-gray-500 font-semibold text-sm mt-2">1h</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-bold text-gray-900">Participation</div>
              <p className="text-green-600 font-semibold text-sm mt-2">Bonne</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          onClick={handlePrevious}
          disabled={currentChildIndex === 0}
          className="text-gray-700 border border-gray-300 rounded-lg px-6 py-2 font-semibold hover:bg-gray-50 disabled:opacity-50"
        >
          Précédent
        </Button>

        <span className="text-sm font-semibold text-gray-600">
          Enfant {currentChildIndex + 1} / {children.length}
        </span>

        {isAllProcessed ? (
          <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-6 py-2 font-semibold">
            Résumé jour
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-6 py-2 font-semibold"
          >
            Suivant
          </Button>
        )}
      </div>
    </div>
  )
}
