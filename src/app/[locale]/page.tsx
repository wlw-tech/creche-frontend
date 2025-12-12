"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useTranslations } from 'next-intl'
import { use } from 'react'
import { Locale } from '@/lib/i18n/config'

export default function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params)
  const currentLocale = resolvedParams.locale
  const t = useTranslations('home')

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <LanguageSwitcher currentLocale={currentLocale} />
        </div>
        
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">{t('title')}</h1>
          <p className="text-lg text-muted-foreground mb-8">{t('subtitle')}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="p-6 border-2 border-primary/20">
              <h2 className="font-semibold mb-2">{t('adminSection')}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t('adminDescription')}
              </p>
              <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/auth/login-user">{t('adminAccess')}</Link>
              </Button>
            </Card>

            <Card className="p-6 border-2 border-secondary/20">
              <h2 className="font-semibold mb-2">{t('parentSection')}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t('parentDescription')}</p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/inscriptions">{t('inscription')}</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
