import AdminNav from "@/components/AdminNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </div>
  );
}
