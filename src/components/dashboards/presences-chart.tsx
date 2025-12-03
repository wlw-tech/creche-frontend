"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { date: "Lun", present: 42, absent: 6 },
  { date: "Mar", present: 44, absent: 4 },
  { date: "Mer", present: 40, absent: 8 },
  { date: "Jeu", present: 46, absent: 2 },
  { date: "Ven", present: 38, absent: 10 },
]

export function PresencesChart() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <span>📊</span> Enfants présents/absents
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5" }} />
          <Legend />
          <Bar dataKey="present" fill="#B8E986" name="Présent" />
          <Bar dataKey="absent" fill="#FF6F61" name="Absent" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
