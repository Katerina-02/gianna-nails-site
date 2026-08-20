-- CreateTable
CREATE TABLE "ClosedPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ClosedPeriod_startDate_idx" ON "ClosedPeriod"("startDate");

-- CreateIndex
CREATE INDEX "ClosedPeriod_endDate_idx" ON "ClosedPeriod"("endDate");
