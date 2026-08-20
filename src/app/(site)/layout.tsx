import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
