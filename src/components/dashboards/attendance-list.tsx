import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const attendanceData = [
  { name: "Laila T.", teacher: "Mme. Amina", status: "Présent" },
  { name: "Youssef M.", teacher: "Mme. Sarah", status: "Absent" },
  { name: "Nour K.", teacher: "M. Hassan", status: "Présent" },
  { name: "Adam B.", teacher: "Mme. Fatima", status: "Présent" },
]

export function AttendanceList() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span>⭐</span> Enfants présents/absents
      </h3>
      <div className="space-y-3">
        {attendanceData.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.teacher}</p>
            </div>
            <Badge
              className={
                item.status === "Présent" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
              }
            >
              {item.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
