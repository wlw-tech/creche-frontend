"use client"

import type React from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations()

  const isArabic = pathname?.startsWith("/ar")
  const currentLocale = isArabic ? "ar" : "fr"
  const nextLocale = isArabic ? "fr" : "ar"

  const handleToggleLanguage = () => {
    if (!pathname) return
    const segments = pathname.split("/")
    if (segments.length > 1) { segments[1] = nextLocale; router.push(segments.join("/") || "/") }
  }

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    try { localStorage.removeItem("token"); localStorage.removeItem("auth_token") } catch {}
    router.push(`/${currentLocale}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Slim top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-sky-50">
              <Image src="/Group 13.svg" alt="PetitsPas" width={28} height={28} />
            </div>
            <span className="text-sm font-bold text-gray-900">PetitsPas</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleToggleLanguage} className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-full px-2.5 py-1">
              {isArabic ? "FR" : "AR"}
            </button>
            <button onClick={handleLogout} className="text-xs font-medium text-red-500 hover:text-red-700 border border-red-100 rounded-full px-2.5 py-1">
              {t("common.logout")}
            </button>
          </div>
        </div>
      </header>
      {/* Main content — add top padding for header */}
      <main className="pt-12">{children}</main>
    </div>
  )
}
