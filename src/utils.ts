import { TICKS_PER_HOUR } from "./constants.js";
import { DemandProbabilities, Kilowatt, KilowattHour, MockSimulationInputWithOutput, MockSimulationResult, PowerUsage, RandomNumberGenerator, UsageEntry } from "types.js";

/**
 * Map a MockSimulationInput with nested MockSimulationOutput to a MockSimulationResult object
 * Used to transform a db result to match the expected GraphQL schema
 */
export function mapToSimulationResult(input: MockSimulationInputWithOutput): MockSimulationResult {
    const { output } = input;

    return {
        input: {
            id: input.id,
            chargerCount: input.chargerCount,
            arrivalProbabilityMultiplier: input.arrivalProbabilityMultiplier,
            consumptionPerKmKWH: input.consumptionPerKmKWH,
            chargerPowerOutputKW: input.chargerPowerOutputKW,
            totalTicks: input.totalTicks,
        },
        output: output ? {
            id: output.id,
            totalEnergyConsumed: output.totalEnergyConsumed,
            totalChargingEvents: output.totalChargingEvents,
            averageChargingEvents: {
                perDay: output.eventsPerDay,
                perWeek: output.eventsPerWeek,
                perMonth: output.eventsPerMonth,
                perYear: output.eventsPerYear,
            },
            exemplaryDay: {
                sampleDay: output.exemplarySampleDay as PowerUsage,
                averageDay: output.exemplaryAverageDay as PowerUsage,
            },
            usage: (output.usage as Array<UsageEntry>)
        } : undefined,
    };
}

/**
 * Randomly sample from the supplied probabilities map n times.
 * Will return n samples where each sample has a likelihood
 * matching the probabilites in provided probability map
 * Our result will be the energy demand for each vehicle that arrived
 */
export function sampleDemand(n: number, consumptionPerKm: number, probabilites: DemandProbabilities, rng: RandomNumberGenerator): number[] {
    const cumulativeProbabilites: Array<{ distance: number, threshold: number }> = [];
    let sum = 0;

    for (const p of probabilites) {
        sum += p.probability;
        cumulativeProbabilites.push({ distance: p.distance, threshold: sum });
    }

    // verify probabilities range
    if (Math.abs(sum - 1.0) > 0.001) {
        throw new Error(`Probabilities must sum to 1, got ${sum}`);
    }

    const samples: KilowattHour[] = [];

    for (let i = 0; i < n; i++) {
        const rand = rng();

        const selected = cumulativeProbabilites.find(p => rand < p.threshold)!;

        if (selected?.distance > 0) {
            samples.push(selected?.distance * consumptionPerKm);
        }
    }

    return samples;
}

/**
 * Randomly sample n times against the provided probability
 * We take the probability that a car will arrive and compare
 * it against a randomly generated probability, the amount that
 * meet that probability threshold is returned.
 * Our result is the number of cars that arrived to charge in the given tick
 */
export function sampleArrivals(n: number, p: number, rng: RandomNumberGenerator): number {
    let count = 0;
    for (let i = 0; i < n; i++) {
        if (rng() < p) count++;
    }
    return count;
}

/**
 * Convert energy demand to charging duration in ticks
 */
export function energyToTicks(energyKWH: KilowattHour, powerKW: Kilowatt): number {
    const hours = energyKWH / powerKW;
    return Math.ceil(hours * TICKS_PER_HOUR); // Round up to ensure full charge
}

/**
 * Format a number to the given decimal places
 */
export function formatNumber(n: number, decimals: number = 3) {
    return Number(n.toFixed(decimals));
}

/**
 * Custom Error class for better GraphQL Validation Error Messages
 */
export class ValidationError extends Error {
    public validationErrors: Record<string, string[]>;
  
    constructor(message: string, validationErrors: Record<string, string[] | undefined>) {
      super(message);
      this.name = "ValidationError";

      // replace undefined errors with an empty array
      this.validationErrors = Object.entries(validationErrors).reduce(
        (acc, [key, val]) => {
          acc[key] = val ?? [];
          return acc;
        },
        {} as Record<string, string[]>
      );
    }
  }