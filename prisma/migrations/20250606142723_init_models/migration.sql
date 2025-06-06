-- CreateTable
CREATE TABLE "MockSimulationInput" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chargerCount" INTEGER NOT NULL,
    "arrivalProbabilityMultiplier" REAL NOT NULL,
    "consumptionPerKmKWH" REAL NOT NULL,
    "chargerPowerOuputKW" REAL NOT NULL,
    "totalTicks" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MockSimulationOutput" (
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
    CONSTRAINT "MockSimulationOutput_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "MockSimulationInput" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MockSimulationOutput_inputId_key" ON "MockSimulationOutput"("inputId");
