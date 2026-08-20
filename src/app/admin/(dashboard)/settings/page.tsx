import { getCurrentAdminEmail } from "./actions";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const email = await getCurrentAdminEmail();

  return (
    <div className="max-w-md">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-foreground">
        Ρυθμίσεις λογαριασμού
      </h1>
      <p className="mt-2 text-sm text-foreground/60">
        Άλλαξε το email ή τον κωδικό εισόδου σου. Χρειάζεται ο τρέχων κωδικός
        για επιβεβαίωση.
      </p>
      <SettingsForm currentEmail={email ?? ""} />
    </div>
  );
}
