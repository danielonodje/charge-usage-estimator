import { ArrivalProbabilities, DemandProbabilities, SimulationInput, MockSimulationInput, RandomNumberGenerator, MockSimulationOutput, SimulationOutput } from './types.js';
import { ONE_TICK, TICKS_PER_DAY, TICKS_PER_HOUR } from './constants.js';


/**
 * Randomly sample from the supplied probabilities map n times.
 * Will return n samples where each sample has a likelihood
 * matching the probabilites in provided probability map
 * Our result will be the energy demand for each vehicle that arrived
 */
function sampleDemand(n: number, consumptionPerKm: number, probabilites: DemandProbabilities, rng: RandomNumberGenerator): number[] {
    const cumulativeProbabilites: Array<{ distance: number, threshold: number }> = [];
    let sum = 0;

    for (const p of probabilites) {
        sum += p.probability;
        cumulativeProbabilites.push({ distance: p.distance, threshold: sum });
    }

    return Array.from({ length: n }, () => {
        const rand = rng();
        // we know the range of probabilities so we can guarantee that selected
        // will always be found.
        const selected = cumulativeProbabilites.find(p => rand < p.threshold)!;
        return selected.distance * consumptionPerKm;
    });
}

/**
 * Randomly sample n times against the provided probability
 * We take the probability that a car will arrive and compare
 * it against a randomly generated probability, the amount that
 * meet that probability threshold is returned.
 * Our result is the number of cars that arrived to charge in the given tick
 */
function sampleArrivals(n: number, p: number, rng: RandomNumberGenerator): number {
    let count = 0;
    for (let i = 0; i < n; i++) {
        if (rng() < p) count++;
    }
    return count;
}


export function simulate(inputParams: SimulationInput, arrivalMap: ArrivalProbabilities, demandMap: DemandProbabilities, rng: RandomNumberGenerator): SimulationOutput {
    let totalEnergy = 0;
    let activeSessions: number[] = [];
    let maxUsage = 0;

    for (let i = 0; i < inputParams.totalTicks; i++) {
        const hour = Math.floor((i % TICKS_PER_DAY) / TICKS_PER_HOUR);

        // we want the probability for this tick, of course this assumes that the probability is uniformly distributed over
        // each quarter-hour, which might not be true in real life but is simpler for the purpose of this simulation
        const currentProbability = arrivalMap[hour] / TICKS_PER_HOUR;

        activeSessions = activeSessions.map(d => d - ONE_TICK).filter(d => d > 0);

        const availableChargers = Math.max(0, inputParams.chargerCount - activeSessions.length);
        const arrivalCount = sampleArrivals(availableChargers, currentProbability, rng);
        const energyDemands = sampleDemand(arrivalCount, inputParams.consumptionPerKmKWH, demandMap, rng);
        const durations = energyDemands.map(e => e / inputParams.chargerPowerOuputKW)

        activeSessions.push(...durations);

        totalEnergy += energyDemands.reduce((sum, e) => sum + e, 0);

        maxUsage = Math.max(maxUsage, activeSessions.length);
    }

    const theoreticalMaxPowerKW = inputParams.chargerCount * inputParams.chargerPowerOuputKW;
    const actualMaxPowerKW = maxUsage * inputParams.chargerPowerOuputKW;

    return {
        totalEnergyConsumedKWH: Math.floor(totalEnergy),
        theoreticalMaxPowerKW,
        actualMaxPowerKW,
        concurrencyFactor: Number((actualMaxPowerKW / theoreticalMaxPowerKW * 100).toFixed(3)) // truncate for readability
    }
}


export function mockSimulate(inputParams: MockSimulationInput, arrivalMap: ArrivalProbabilities, demandMap: DemandProbabilities): MockSimulationOutput {
    const averageEnergyUsage = demandMap.reduce((sum, d) => sum + (d.probability * d.distance * inputParams.consumptionPerKmKWH), 0);
    const usage: Record<number, { totalEnergyUsed: number }> = {};

    let carsCharged = 0;
    let totalEnergy = 0;
    for (let i = 0; i < inputParams.totalTicks; i++) {
        const hour = Math.floor((i % TICKS_PER_DAY) / TICKS_PER_HOUR);
        const day = Math.floor(i / TICKS_PER_DAY);
        const arrivalProbabilty = arrivalMap[hour] / TICKS_PER_HOUR;

        const arrivalCount = inputParams.chargerCount * arrivalProbabilty;
        carsCharged += arrivalCount;
        totalEnergy += arrivalCount * averageEnergyUsage;

        if (!usage[day]) usage[day] = { totalEnergyUsed: 0 };
        usage[day].totalEnergyUsed += arrivalCount * averageEnergyUsage;
    }

    const totalDays = Object.keys(usage).length;
    const averageDayEnergy = Object.values(usage).reduce(
        (sum, d) => sum + d.totalEnergyUsed, 0
    ) / totalDays;

    return {
        usage,
        exemplaryDay: {
            sampleDay: usage[0],
            averageDay: { totalEnergyUsed: averageDayEnergy }
        },
        totalEnergyConsumed: totalEnergy,
        averageChargingEvents: {
            perDay: Math.floor((carsCharged / inputParams.totalTicks) * TICKS_PER_HOUR * 24),
            perWeek: Math.floor((carsCharged / inputParams.totalTicks) * TICKS_PER_HOUR * 24 * 7),
            perMonth: Math.floor((carsCharged / inputParams.totalTicks) * TICKS_PER_HOUR * 24 * 7 * 4),
            perYear: Math.floor(carsCharged)
        }
    };
}