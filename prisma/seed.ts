import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// Πραγματικός τιμοκατάλογος του καταστήματος. Οι διάρκειες είναι εκτιμήσεις
// (η ιδιοκτήτρια μπορεί να τις προσαρμόσει ανά πάσα στιγμή από το
// /admin/services).
const SERVICES = [
  // Φυσική Ενίσχυση με Gel ή Rubber Base
  { name: "Ενίσχυση Gel/Rubber Base — Small", description: "Φυσική ενίσχυση με Gel ή Rubber Base, κοντό νύχι.", price: 30, durationMinutes: 60 },
  { name: "Ενίσχυση Gel/Rubber Base — Small με βαφή", description: "Φυσική ενίσχυση με Gel ή Rubber Base, κοντό νύχι, με βαφή.", price: 35, durationMinutes: 75 },
  { name: "Ενίσχυση Gel/Rubber Base — Medium", description: "Φυσική ενίσχυση με Gel ή Rubber Base, μεσαίο νύχι.", price: 35, durationMinutes: 75 },
  { name: "Ενίσχυση Gel/Rubber Base — Medium με βαφή", description: "Φυσική ενίσχυση με Gel ή Rubber Base, μεσαίο νύχι, με βαφή.", price: 40, durationMinutes: 90 },

  // Φυσική Ενίσχυση με Ακρυλικό
  { name: "Ενίσχυση Ακρυλικού — Small", description: "Φυσική ενίσχυση με ακρυλικό, κοντό νύχι.", price: 40, durationMinutes: 75 },
  { name: "Ενίσχυση Ακρυλικού — Small με βαφή", description: "Φυσική ενίσχυση με ακρυλικό, κοντό νύχι, με βαφή.", price: 45, durationMinutes: 90 },
  { name: "Ενίσχυση Ακρυλικού — Small με ανόρθωση ελεύθερου άκρου", description: "Φυσική ενίσχυση με ακρυλικό και ανόρθωση ελεύθερου άκρου, κοντό νύχι.", price: 45, durationMinutes: 90 },
  { name: "Ενίσχυση Ακρυλικού — Small με ανόρθωση & βαφή", description: "Φυσική ενίσχυση με ακρυλικό, ανόρθωση ελεύθερου άκρου και βαφή, κοντό νύχι.", price: 50, durationMinutes: 105 },
  { name: "Ενίσχυση Ακρυλικού — Medium με ανόρθωση ελεύθερου άκρου", description: "Φυσική ενίσχυση με ακρυλικό και ανόρθωση ελεύθερου άκρου, μεσαίο νύχι.", price: 45, durationMinutes: 90 },
  { name: "Ενίσχυση Ακρυλικού — Medium με ανόρθωση & βαφή", description: "Φυσική ενίσχυση με ακρυλικό, ανόρθωση ελεύθερου άκρου και βαφή, μεσαίο νύχι.", price: 50, durationMinutes: 105 },

  // Επιμήκυνση Νυχιών
  { name: "Επιμήκυνση Νυχιών — Small", description: "Επιμήκυνση νυχιών, κοντό νύχι.", price: 45, durationMinutes: 90 },
  { name: "Επιμήκυνση Νυχιών — Small με βαφή", description: "Επιμήκυνση νυχιών, κοντό νύχι, με βαφή.", price: 50, durationMinutes: 105 },
  { name: "Επιμήκυνση Νυχιών — Medium", description: "Επιμήκυνση νυχιών, μεσαίο νύχι.", price: 50, durationMinutes: 105 },
  { name: "Επιμήκυνση Νυχιών — Medium με βαφή", description: "Επιμήκυνση νυχιών, μεσαίο νύχι, με βαφή.", price: 55, durationMinutes: 120 },
  { name: "Επιμήκυνση Νυχιών — Large", description: "Επιμήκυνση νυχιών, μεγάλο νύχι.", price: 55, durationMinutes: 120 },
  { name: "Επιμήκυνση Νυχιών — Large με βαφή", description: "Επιμήκυνση νυχιών, μεγάλο νύχι, με βαφή.", price: 60, durationMinutes: 135 },

  // Πεντικιούρ
  { name: "Πεντικιούρ χωρίς βαφή", description: "Περιποίηση νυχιών ποδιών χωρίς βαφή.", price: 30, durationMinutes: 45 },
  { name: "Πεντικιούρ με βαφή", description: "Περιποίηση νυχιών ποδιών με βαφή.", price: 35, durationMinutes: 60 },
  { name: "Πεντικιούρ θεραπευτικό", description: "Θεραπευτικό πεντικιούρ (τιμή από).", price: 35, durationMinutes: 60 },

  // Ειδικές θεραπείες
  { name: "Διορθωτικό έλασμα εισφρυμένου νυχιού", description: "Τοποθέτηση διορθωτικού ελάσματος για διόρθωση εισφρήσης.", price: 40, durationMinutes: 45 },

  // Έξτρα — προστίθενται πάνω σε κύρια υπηρεσία. Τα πρώτα τρία μπορούν να
  // κλειστούν και μόνα τους σαν ραντεβού (standalone: true), η διακόσμηση όχι.
  { name: "Σπασμένο νύχι (ανά νύχι)", description: "Επισκευή σπασμένου νυχιού.", price: 3, durationMinutes: 20, isExtra: true, standalone: true },
  { name: "Εξαγωγή εισφρήσης (1 νύχι)", description: "Εξαγωγή εισφρυμένου νυχιού.", price: 5, durationMinutes: 20, isExtra: true, standalone: true },
  { name: "Lift Up Gel (ανά νύχι)", description: "Τοποθέτηση Lift Up Gel.", price: 10, durationMinutes: 20, isExtra: true, standalone: true },
  { name: "Διακόσμηση με σκόνες", description: "Διακόσμηση νυχιών με σκόνες.", price: 5, durationMinutes: 20, isExtra: true, standalone: false },
];

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";

  const existingAdmin = await db.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.adminUser.create({ data: { email: adminEmail, passwordHash } });
    console.log(`Δημιουργήθηκε admin χρήστης: ${adminEmail}`);
  } else {
    console.log(`Ο admin χρήστης ${adminEmail} υπάρχει ήδη.`);
  }

  const serviceCount = await db.service.count();
  if (serviceCount === 0) {
    await db.service.createMany({
      data: SERVICES.map((s, i) => ({ ...s, order: i })),
    });
    console.log(`Προστέθηκαν ${SERVICES.length} υπηρεσίες.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
