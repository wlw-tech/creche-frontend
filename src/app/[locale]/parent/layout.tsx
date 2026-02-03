"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  // Déterminer la locale actuelle à partir de l'URL (/fr/... ou /ar/...)
  const isArabic = pathname?.startsWith("/ar")
  const currentLocale = isArabic ? "ar" : "fr"
  const currentLabel = isArabic ? "AR" : "FR"
  const nextLocale = isArabic ? "fr" : "ar"
  const nextLabel = isArabic ? "FR" : "AR"

  const handleToggleLanguage = () => {
    if (!pathname) return

    const segments = pathname.split("/")
    if (segments.length > 1) {
      segments[1] = nextLocale
      const newPath = segments.join("/") || "/"
      router.push(newPath)
    }
  }

  const handleLogout = () => {
    // Nettoyage basique côté client
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    try {
      localStorage.removeItem("token")
      localStorage.removeItem("auth_token")
    } catch {
      // ignore
    }

    const loginPath = `/${currentLocale}/auth/login-user`
    router.push(loginPath)
  }

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
              <p className="text-sm text-gray-500">Bienvenue sur Petitspas</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleLanguage}
              className="rounded-full"
            >
              {currentLabel} • {nextLabel}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">{children}</main>
    </div>
  )
}
