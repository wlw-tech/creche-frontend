import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const admissions = [
  { name: "Amin El Fassi", age: "2 ans", date: "20/10/2025", status: "En revue" },
  { name: "Lina Tazi", age: "3 ans", date: "18/10/2025", status: "Accepté" },
  { name: "Omar Benjaloum", age: "4 ans", date: "22/10/2025", status: "Attente" },
]

export function RecentAdmissions() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span>🌱</span> Admissions en attente
      </h3>
      <div className="space-y-3">
        {admissions.map((adm, idx) => (
          <div key={idx} className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-sm text-foreground">{adm.name}</p>
                <p className="text-xs text-muted-foreground">
                  {adm.age} • {adm.date}
                </p>
              </div>
              {adm.status === "En revue" && <Badge className="bg-blue-100 text-blue-700">En revue</Badge>}
              {adm.status === "Accepté" && <Badge className="bg-green-100 text-green-700">Accepté</Badge>}
              {adm.status === "Attente" && <Badge className="bg-gray-100 text-gray-700">Attente</Badge>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs bg-transparent">
                Voir détails
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
