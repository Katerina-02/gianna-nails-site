-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT NOT NULL,
    "clientEmail" TEXT,
    "facebookUsername" TEXT,
    "instagramUsername" TEXT,
    "comments" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("clientName", "clientPhone", "comments", "createdAt", "date", "endTime", "facebookUsername", "id", "instagramUsername", "serviceId", "startTime") SELECT "clientName", "clientPhone", "comments", "createdAt", "date", "endTime", "facebookUsername", "id", "instagramUsername", "serviceId", "startTime" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE INDEX "Appointment_date_idx" ON "Appointment"("date");
CREATE INDEX "Appointment_clientPhone_idx" ON "Appointment"("clientPhone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
