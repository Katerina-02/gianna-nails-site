import { db } from "@/lib/db";
import AdminDayView from "@/components/AdminDayView";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <AdminDayView
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        durationMinutes: s.durationMinutes,
        isExtra: s.isExtra,
        standalone: s.standalone,
      }))}
    />
  );
}
