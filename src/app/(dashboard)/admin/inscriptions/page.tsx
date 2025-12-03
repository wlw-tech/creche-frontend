"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

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

export default function InscriptionsPage() {
  const [search, setSearch] = useState("")

  const filtered = inscriptionsData.filter((insc) => insc.childName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Toutes les inscriptions</h1>
        <p className="text-muted-foreground">{inscriptionsData.length} inscriptions</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
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
                {insc.status === "En revue" && <Badge className="bg-blue-100 text-blue-700">En revue</Badge>}
                {insc.status === "Accepté" && <Badge className="bg-green-100 text-green-700">Accepté</Badge>}
                {insc.status === "Attente" && <Badge className="bg-gray-100 text-gray-700">Attente</Badge>}
                {insc.status === "Refusé" && <Badge className="bg-red-100 text-red-700">Refusé</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-border text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Parent</p>
                <p className="font-medium">{insc.parentName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Groupe souhaité</p>
                <p className="font-medium">{insc.group}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-medium text-xs">{insc.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Allergies</p>
                <p className="font-medium">{insc.allergies}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                Voir détails
              </Button>
              {insc.status !== "Accepté" && insc.status !== "Refusé" && (
                <>
                  <Button size="sm" className="flex-1 bg-green-100 text-green-700 hover:bg-green-200">
                    Accepter
                  </Button>
                  <Button size="sm" className="flex-1 bg-red-100 text-red-700 hover:bg-red-200">
                    Refuser
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
