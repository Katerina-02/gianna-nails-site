import ServicesManager from "@/components/ServicesManager";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await db.service.findMany({ orderBy: { order: "asc" } });
  return (
    <ServicesManager
      initialServices={services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price,
        durationMinutes: s.durationMinutes,
        active: s.active,
        order: s.order,
        isExtra: s.isExtra,
        standalone: s.standalone,
      }))}
    />
  );
}
