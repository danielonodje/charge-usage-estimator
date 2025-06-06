export type Kilowatt = number
export type KilowattHour = number

export type PowerUsage = { totalEnergyUsed: Kilowatt }

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
    concurrencyFactor: number
}

export type MockSimulationInput = {
    chargerCount: number;
    arrivalProbabilityMultiplier: number;
    consumptionPerKmKWH: KilowattHour;
    chargerPowerOuputKW: Kilowatt
    totalTicks: number
}

export type MockSimulationOutput = {
    usage: Record<number, PowerUsage>,
    exemplaryDay: { sampleDay: PowerUsage, averageDay: PowerUsage },
    totalEnergyConsumed: Kilowatt,
    averageChargingEvents: {
        perDay: number,
        perWeek: number,
        perMonth: number,
        perYear: number
    }
}

export type DemandProbabilities = Array<{ probability: number, distance: number }>
export type ArrivalProbabilities = Record<number, number>;
export type RandomNumberGenerator = () => number