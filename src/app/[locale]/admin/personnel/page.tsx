import { Card } from "@/components/ui/card"

export default function PersonnelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tout le personnel</h1>
        <p className="text-muted-foreground mt-2">Gestion des enseignants et staff</p>
      </div>

      <Card className="p-6">
        <p className="text-center text-muted-foreground py-12">Page en construction • Fonctionnalité à venir</p>
      </Card>
    </div>
  )
}
