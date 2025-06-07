/*
  Warnings:

  - You are about to drop the column `chargerPowerOuputKW` on the `MockSimulationInput` table. All the data in the column will be lost.
  - Added the required column `chargerPowerOutputKW` to the `MockSimulationInput` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalChargingEvents` to the `MockSimulationOutput` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MockSimulationInput" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chargerCount" INTEGER NOT NULL,
    "arrivalProbabilityMultiplier" REAL NOT NULL,
    "consumptionPerKmKWH" REAL NOT NULL,
    "chargerPowerOutputKW" REAL NOT NULL,
    "totalTicks" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_MockSimulationInput" ("arrivalProbabilityMultiplier", "chargerCount", "consumptionPerKmKWH", "createdAt", "id", "totalTicks") SELECT "arrivalProbabilityMultiplier", "chargerCount", "consumptionPerKmKWH", "createdAt", "id", "totalTicks" FROM "MockSimulationInput";
DROP TABLE "MockSimulationInput";
ALTER TABLE "new_MockSimulationInput" RENAME TO "MockSimulationInput";
CREATE TABLE "new_MockSimulationOutput" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inputId" INTEGER NOT NULL,
    "totalEnergyConsumed" REAL NOT NULL,
    "usage" JSONB NOT NULL,
    "exemplarySampleDay" JSONB NOT NULL,
    "exemplaryAverageDay" JSONB NOT NULL,
    "eventsPerDay" REAL NOT NULL,
    "eventsPerWeek" REAL NOT NULL,
    "eventsPerMonth" REAL NOT NULL,
    "eventsPerYear" REAL NOT NULL,
    "totalChargingEvents" REAL NOT NULL,
    CONSTRAINT "MockSimulationOutput_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "MockSimulationInput" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MockSimulationOutput" ("eventsPerDay", "eventsPerMonth", "eventsPerWeek", "eventsPerYear", "exemplaryAverageDay", "exemplarySampleDay", "id", "inputId", "totalEnergyConsumed", "usage") SELECT "eventsPerDay", "eventsPerMonth", "eventsPerWeek", "eventsPerYear", "exemplaryAverageDay", "exemplarySampleDay", "id", "inputId", "totalEnergyConsumed", "usage" FROM "MockSimulationOutput";
DROP TABLE "MockSimulationOutput";
ALTER TABLE "new_MockSimulationOutput" RENAME TO "MockSimulationOutput";
CREATE UNIQUE INDEX "MockSimulationOutput_inputId_key" ON "MockSimulationOutput"("inputId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
