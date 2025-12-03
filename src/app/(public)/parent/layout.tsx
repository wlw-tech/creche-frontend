"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [language, setLanguage] = useState("FR")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-200">
              <span className="text-lg">👨‍👩‍👧</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard Parent</h1>
              <p className="text-sm text-gray-500">Bienvenue sur Le Nido</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "FR" ? "AR" : "FR")}
              className="rounded-full"
            >
              {language} • {language === "FR" ? "AR" : "FR"}
            </Button>
            <Link href="/logout">
              <Button variant="ghost" size="sm">
                Déconnexion
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">{children}</main>
    </div>
  )
}
