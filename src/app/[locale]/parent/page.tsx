"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from 'next-intl'
import { use } from 'react'
import { Locale } from '@/lib/i18n/config'

export default function ParentDashboard({ params }: { params: Promise<{ locale: Locale }> }) {
  const resolvedParams = use(params)
  const t = useTranslations('parent')
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

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  const [todayMenu] = useState({
    date: "Mardi 28 Septembre 2025",
    breakfast: "Lait + céréales",
    lunch: "Poulet aux légumes + riz",
    snack: "Compote de pommes + gâteau natur",
  })

  const upcomingEvents = [
    {
      id: 1,
      date: "30 SEP",
      title: t('events.parentMeeting'),
      time: "14:00 – 16:00",
    },
    {
      id: 2,
      date: "05 OCT",
      title: t('events.parkOuting'),
      time: "09:00 – 12:00",
    },
  ]

  const authorizedPersons = [
    { name: t('profile.mother'), role: t('profile.motherRole'), phone: "06 12 34 56 78" },
    { name: t('profile.father'), role: t('profile.fatherRole'), phone: "06 98 76 54 32" },
    { name: t('profile.grandmother'), role: t('profile.grandmotherRole'), phone: "06 11 22 33 44" },
  ]

  const handlePasswordChange = () => {
    if (passwords.new === passwords.confirm) {
      console.log("Password changed:", passwords)
      setPasswords({ current: "", new: "", confirm: "" })
      setShowPasswordForm(false)
      alert(t('profile.passwordChanged'))
    } else {
      alert(t('profile.passwordMismatch'))
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-3 md:px-4 lg:px-0 pb-10">
      {/* Child Header Card */}
      <Card className="border-0 bg-gradient-to-r from-sky-100 to-sky-50 shadow-md rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
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
  {/* Barre d’onglets */}
  <div className="mt-4 flex justify-center">
    <TabsList
      className="
        inline-flex items-center gap-1 
        bg-sky-50 border border-sky-100 
        rounded-full px-2 py-1 shadow-sm
      "
    >
      <TabsTrigger
        value="overview"
        className="
          inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold
          rounded-full
          text-sky-700/70
          data-[state=active]:bg-white data-[state=active]:text-sky-700
          hover:bg-white/70 hover:text-sky-700
        "
      >
        <span>👁️</span>
        <span>{t('tabs.overview')}</span>
      </TabsTrigger>

      <TabsTrigger
        value="menu"
        className="
          inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold
          rounded-full
          text-sky-700/70
          data-[state=active]:bg-white data-[state=active]:text-sky-700
          hover:bg-white/70 hover:text-sky-700
        "
      >
        <span>🍽️</span>
        <span>{t('tabs.menu')}</span>
      </TabsTrigger>

      <TabsTrigger
        value="profile"
        className="
          inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold
          rounded-full
          text-sky-700/70
          data-[state=active]:bg-white data-[state=active]:text-sky-700
          hover:bg-white/70 hover:text-sky-700
        "
      >
        <span>👤</span>
        <span>{t('tabs.profile')}</span>
      </TabsTrigger>
    </TabsList>
  </div>


        {/* Vue d'ensemble Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Daily Summary */}
          <Card className="border border-sky-100 shadow-sm rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
            <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
              <CardTitle className="text-base font-bold text-gray-900">{t('overview.dailySummaryTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed text-gray-600">
                Aujourd'hui, les enfants ont participé à des activités de motricité fine et de dessin collectif. Très
                bon moment d'apprentissage !
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border border-sky-100 shadow-sm rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
            <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
              <CardTitle className="text-base font-bold text-gray-900">{t('overview.upcomingEventsTitle')}</CardTitle>
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

        {/* Menu du jour Tab */}
        <TabsContent value="menu" className="space-y-6">
          <Card className="border-2 border-sky-300 shadow-md rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
            <CardHeader className="border-b border-sky-300 bg-gradient-to-r from-sky-100 to-sky-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                <span>🍽️</span> {t('menu.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm font-semibold text-sky-700 mb-4">{todayMenu.date}</p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-xl flex-shrink-0">🥛</span>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Petit-déjeuner</p>
                    <p className="text-sm font-semibold text-gray-900">{todayMenu.breakfast}</p>
                  </div>
                </div>
                <div className="flex gap-3 border-t pt-4">
                  <span className="text-xl flex-shrink-0">🍗</span>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Déjeuner</p>
                    <p className="text-sm font-semibold text-gray-900">{todayMenu.lunch}</p>
                  </div>
                </div>
                <div className="flex gap-3 border-t pt-4">
                  <span className="text-xl flex-shrink-0">🍎</span>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Goûter</p>
                    <p className="text-sm font-semibold text-gray-900">{todayMenu.snack}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profil Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Child Information */}
            <Card className="border border-sky-100 shadow-sm rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
              <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <span>ℹ️</span> {t('profile.childInfoTitle')}
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
                  <p className="text-xs font-medium text-gray-500 uppercase">{t('profile.birthdateLabel')}</p>
                  <p className="font-semibold text-gray-900">15 Mars 2022</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase">{t('profile.allergiesLabel')}</p>
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
            <Card className="border border-sky-100 shadow-sm rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
              <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <span>👥</span> {t('profile.authorizedPersonsTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {authorizedPersons.map((person) => (
                  <div key={person.phone} className="rounded-lg bg-sky-50 p-3 border border-sky-100">
                    <p className="font-semibold text-gray-900">{person.name}</p>
                    <p className="text-xs text-gray-600">{person.role}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{person.phone}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="border border-sky-100 shadow-sm rounded-2xl transition-transform duration-200 hover:-translate-y-0.5">
              <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-transparent pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <span>🔐</span> {t('profile.securityTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {!showPasswordForm ? (
                  <Button
                    onClick={() => setShowPasswordForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-transform duration-150 hover:-translate-y-0.5"
                  >
                    {t('profile.changePasswordCta')}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase">Mot de passe actuel</label>
                      <Input
                        type="password"
                        placeholder="Entrez votre mot de passe actuel"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase">Nouveau mot de passe</label>
                      <Input
                        type="password"
                        placeholder="Entrez un nouveau mot de passe"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 uppercase">Confirmer le mot de passe</label>
                      <Input
                        type="password"
                        placeholder="Confirmez le nouveau mot de passe"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="mt-1 border-gray-300"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handlePasswordChange} className="bg-green-600 hover:bg-green-700 text-white">
                        Enregistrer
                      </Button>
                      <Button onClick={() => setShowPasswordForm(false)} variant="outline" className="border-gray-300">
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
       
      </Tabs>
    </div>
  )
}
