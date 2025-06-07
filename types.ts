import { Prisma } from './generated/prisma/client.js';

export type Kilowatt = number
export type KilowattHour = number

export type PowerUsage = { totalEnergyUsed: Kilowatt }

export type UsageEntry = {
    day: number,
    data: PowerUsage
}

export type ChargingSession = {
    remainingTicks: number;
    energyKWH: KilowattHour;
    endTick: number;
}

export type TimeSeriesData = {
    tick: number;
    activeSessions: number;
    arrivalCount: number;
    completions: number;
    powerUsageKW: Kilowatt;
}

export type SimulationInput = {
    chargerCount: number;
    consumptionPerKmKWH: KilowattHour;
    chargerPowerOuputKW: Kilowatt
    totalTicks: number
}

export type SimulationOutput = {
    totalEnergyConsumedKWH: KilowattHour;
    theoreticalMaxPowerKW: Kilowatt;
    actualMaxPowerKW: Kilowatt;
    concurrencyFactor: number;
    totalChargingEvents: number;
    peakUtilization: number;
    timeSeriesData: Array<TimeSeriesData>
}

export type MockSimulationInputWithOutput = Prisma.MockSimulationInputGetPayload<{
    include: {
        output: true
    }
}>

export type MockSimulationResult = {
    input: MockSimulationInput & { id: number }
    output: MockSimulationOutput & { id: number } | undefined
}

export type MockSimulationInput = {
    chargerCount: number;
    arrivalProbabilityMultiplier: number;
    consumptionPerKmKWH: KilowattHour;
    chargerPowerOutputKW: Kilowatt
    totalTicks: number
}

export type MockSimulationOutput = {
    usage: Array<UsageEntry>
    exemplaryDay: { sampleDay: PowerUsage, averageDay: PowerUsage },
    totalEnergyConsumed: Kilowatt,
    totalChargingEvents: number,
    averageChargingEvents: {
        perDay: number,
        perWeek: number,
        perMonth: number,
        perYear: number
    }
}

type DemandProbabiityEntry = { probability: number, distance: number }
export type DemandProbabilities = Array<DemandProbabiityEntry>
export type ArrivalProbabilities = Record<number, number>;
export type RandomNumberGenerator = () => number