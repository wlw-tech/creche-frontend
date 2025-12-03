export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">
        Dashboard Administrateur
      </h1>
      <p className="text-muted-foreground">
        Bienvenue sur le panneau d'administration. Utilisez le menu de gauche pour gérer les classes,
        les utilisateurs, les enfants et les menus.
      </p>
    </div>
  );
}


// "use client"

// import { Card } from "@/components/ui/card"
// import { AlertCircle, DollarSign, Users } from "lucide-react"
// import { PresencesChart } from "@/components/dashboards/presences-chart"
// import { RecentAdmissions } from "@/components/dashboards/recent-admissions"
// import { AnnouncementsEvents } from "@/components/dashboards/announcements-events"
// import { AttendanceList } from "@/components/dashboards/attendance-list"
// import { getTranslations } from "next-intl/server";
// type Props = {
//   params: { locale: string };
// };
// export default function AdminDashboard() {
//   return (
//     <div className="space-y-6">
//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card className="p-6 border-2 border-primary/20">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground mb-1">Présences du jour</p>
//               <div className="flex items-baseline gap-2">
//                 <p className="text-3xl font-bold text-foreground">42/48</p>
//                 <span className="text-sm text-secondary-foreground">87.5% présent</span>
//               </div>
//             </div>
//             <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
//               <span className="text-2xl">🟢</span>
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6 border-2 border-secondary/20">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground mb-1">Conformité des ratios</p>
//               <div className="flex items-baseline gap-2">
//                 <p className="text-3xl font-bold text-foreground">1:6</p>
//                 <span className="text-sm text-secondary-foreground">Conforme</span>
//               </div>
//             </div>
//             <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
//               <AlertCircle className="w-6 h-6 text-secondary-foreground" />
//             </div>
//           </div>
//         </Card>

   

//         <Card className="p-6">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm text-muted-foreground mb-1">Utilisateurs actifs</p>
//               <div className="flex items-baseline gap-2">
//                 <p className="text-3xl font-bold text-foreground">12</p>
//                 <span className="text-sm text-secondary-foreground">Cette semaine</span>
//               </div>
//             </div>
//             <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
//               <Users className="w-6 h-6 text-muted-foreground" />
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column */}
//         <div className="lg:col-span-2 space-y-6">
//           <AttendanceList />
//           <PresencesChart />
//           <AnnouncementsEvents />
//         </div>

  
//       </div>
//     </div>
//   )
// }
