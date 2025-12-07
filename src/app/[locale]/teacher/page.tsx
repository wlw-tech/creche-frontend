"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export default function TeacherDashboard() {
  const t = useTranslations("teacher.dashboard")
  const pathname = usePathname()
  const router = useRouter()

  const isArabic = pathname?.startsWith("/ar")
  const currentLocale = isArabic ? "ar" : "fr"
  const currentLabel = isArabic ? "AR" : "FR"
  const nextLocale = isArabic ? "fr" : "ar"
  const nextLabel = isArabic ? "FR" : "AR"

  const [currentChildIndex, setCurrentChildIndex] = useState(0)
  const [attendanceData, setAttendanceData] = useState({})

  const children = [
    { id: 1, name: "Laila T.", age: "4 ans", class: "Salle Bleue", allergies: ["Arachides"] },
    { id: 2, name: "Youssef M.", age: "3 ans", class: "Salle Bleue", allergies: [] },
    { id: 3, name: "Nour K.", age: "3 ans", class: "Salle Bleue", allergies: ["Noix"] },
    { id: 4, name: "Adam B.", age: "2 ans", class: "Salle Bleue", allergies: [] },
  ]

  const currentChild = children[currentChildIndex]

  const handlePresence = (presence: string) => {
    setAttendanceData({ ...attendanceData, [currentChild.id]: presence })
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
  const progressPercent = ((currentChildIndex + 1) / children.length) * 100

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 md:px-6 lg:px-0 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">{t("subtitle")}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Child Card */}
        <div className="lg:col-span-1">
          <Card className="border-2 border-sky-200 bg-white shadow-md h-full rounded-2xl">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Child Info */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-200 to-sky-300 flex items-center justify-center text-2xl md:text-3xl font-bold text-sky-700 flex-shrink-0">
                    {currentChild.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{currentChild.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentChild.age} • {currentChild.class}
                    </p>
                    {currentChild.allergies.length > 0 && (
                      <p className="text-xs font-bold text-red-600 mt-2">🚨 {currentChild.allergies.join(", ")}</p>
                    )}
                  </div>
                </div>

                {/* Presence Time */}
                <div className="text-xs text-gray-600 font-medium">{t("presenceTime")}</div>

                {/* Attendance Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePresence("present")}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg py-3 text-base"
                  >
                    ✓ {t("presentButton")}
                  </Button>
                  <Button
                    onClick={() => handlePresence("absent")}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg py-3 text-base"
                  >
                    ✕ {t("absentButton")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Daily Summary */}
        <div className="lg:col-span-2">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">{t("daySummaryTitle")}</h3>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition rounded-2xl">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🍽️</div>
                    <p className="text-xs font-medium text-gray-600">{t("cards.appetiteLabel")}</p>
                    <p className="text-lg font-bold text-green-600 mt-1">{t("cards.appetiteValue")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">😊</div>
                    <p className="text-xs font-medium text-gray-600">{t("cards.moodLabel")}</p>
                    <p className="text-lg font-bold text-sky-500 mt-1">{t("cards.moodValue")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">😴</div>
                    <p className="text-xs font-medium text-gray-600">{t("cards.napLabel")}</p>
                    <p className="text-lg font-bold text-gray-700 mt-1">{t("cards.napValue")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">⭐</div>
                    <p className="text-xs font-medium text-gray-600">{t("cards.participationLabel")}</p>
                    <p className="text-lg font-bold text-green-600 mt-1">{t("cards.participationValue")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Progress */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <Button
          onClick={handlePrevious}
          disabled={currentChildIndex === 0}
          className="text-gray-700 border border-gray-300 rounded-lg px-5 py-2 font-medium text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← {t("prev")}
        </Button>

        <div className="flex-1 mx-8 flex items-center gap-5 ">
          <div className="flex-1">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-600 whitespace-nowrap ">
            {currentChildIndex + 1} / {children.length}
          </span>
        </div>

        {isAllProcessed ? (
          <Link href="/teacher/summary">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-9 py-3 mx-2-semibold text-sm">
              {t("summaryCta")} →
            </Button>
          </Link>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-7 py-2 mx-5 emibold text-sm"
          >
            {t("next")} →
          </Button>
        )}
      </div>
    </div>
  )
}
