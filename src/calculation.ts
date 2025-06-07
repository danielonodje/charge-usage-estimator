import { ArrivalProbabilities, DemandProbabilities, SimulationInput, MockSimulationInput, RandomNumberGenerator, MockSimulationOutput, SimulationOutput, TimeSeriesData, ChargingSession, PowerUsage } from '../types.js';
import { DAYS_PER_WEEK, MONTHS_PER_YEAR, TICKS_PER_DAY, TICKS_PER_HOUR, WEEKS_PER_MONTH } from './constants.js';
import { sampleArrivals, sampleDemand, energyToTicks, formatNumber } from './utils.js';

/**
 * Simulate Charging sessions over the supplied amount of ticks and return
 * the energy usage for those sesssions.
 */
export function simulate(inputParams: SimulationInput, arrivalMap: ArrivalProbabilities, demandMap: DemandProbabilities, rng: RandomNumberGenerator): SimulationOutput {
    const sessionsByEndTick: ChargingSession[][] = Array(inputParams.totalTicks + 1000) // Extra space for sessions ending after simulation
        .fill(null)
        .map(() => []);
    
    let totalEnergyConsumed = 0;
    let totalChargingEvents = 0;
    let activeSessions = 0;
    let maxConcurrentSessions = 0;
    
    // Time series data for debugging/visualization
    const timeSeriesData: TimeSeriesData[] = [];

    for (let tick = 0; tick < inputParams.totalTicks; tick++) {
        const hour = Math.floor((tick % TICKS_PER_DAY) / TICKS_PER_HOUR);

        // we want the probability for this tick, of course this assumes that the probability is uniformly distributed over
        // each quarter-hour, which might not be true in real life but is simpler for the purpose of this simulation
        const currentProbability = arrivalMap[hour] / TICKS_PER_HOUR;

        let completions = 0;
        for (const session of sessionsByEndTick[tick] || []) {
            activeSessions--;
            completions++;
            totalEnergyConsumed += session.energyKWH;
        }

        const availableChargers = Math.max(0, inputParams.chargerCount - activeSessions);
        const arrivalCount = sampleArrivals(availableChargers, currentProbability, rng);

        if (arrivalCount > 0) {
            const energyDemands = sampleDemand(arrivalCount, inputParams.consumptionPerKmKWH, demandMap, rng);

            for (const demand of energyDemands) {
                const durationAsTicks = energyToTicks(demand, inputParams.chargerPowerOuputKW);
                const endTick = tick + durationAsTicks;

                const session: ChargingSession = {
                    remainingTicks: durationAsTicks,
                    energyKWH: demand,
                    endTick: endTick
                };

                if (endTick < sessionsByEndTick.length) {
                    sessionsByEndTick[endTick].push(session);
                    activeSessions++;
                    totalChargingEvents++;
                }
            }
        }

        maxConcurrentSessions = Math.max(maxConcurrentSessions, activeSessions);

        timeSeriesData.push({
            tick,
            activeSessions,
            arrivalCount,
            completions,
            powerUsageKW: activeSessions * inputParams.chargerPowerOuputKW
        });
    }

    const theoreticalMaxPowerKW = inputParams.chargerCount * inputParams.chargerPowerOuputKW;
    const actualMaxPowerKW = maxConcurrentSessions * inputParams.chargerPowerOuputKW;

    return {
        totalEnergyConsumedKWH: formatNumber(totalEnergyConsumed),
        theoreticalMaxPowerKW: formatNumber(theoreticalMaxPowerKW),
        actualMaxPowerKW,
        concurrencyFactor: formatNumber(actualMaxPowerKW / theoreticalMaxPowerKW * 100),
        totalChargingEvents,
        peakUtilization: maxConcurrentSessions,
        timeSeriesData
    }
}

/**
 * Roughly estimate the energy used while charging using the supplied paramaters
 */
export function mockSimulate(inputParams: MockSimulationInput, arrivalMap: ArrivalProbabilities, demandMap: DemandProbabilities): MockSimulationOutput {
    const averageEnergyUsage = demandMap.reduce((sum, d) => sum + (d.probability * d.distance * inputParams.consumptionPerKmKWH), 0);
    const totalDays = Math.ceil(inputParams.totalTicks / TICKS_PER_DAY);
    const actualDays = Math.min(totalDays, inputParams.totalTicks / TICKS_PER_DAY);
    const usage: Array<PowerUsage> = Array(totalDays)
        .fill(null)
        .map(() => ({ totalEnergyUsed: 0 }));

    let totalChargingEvents = 0;
    let totalEnergyConsumed = 0;
    for (let i = 0; i < inputParams.totalTicks; i++) {
        const hour = Math.floor((i % TICKS_PER_DAY) / TICKS_PER_HOUR);
        const day = Math.floor(i / TICKS_PER_DAY);

        const arrivalProbabilty = arrivalMap[hour] / TICKS_PER_HOUR * (inputParams.arrivalProbabilityMultiplier / 100);
        const expectedArrivals = inputParams.chargerCount * arrivalProbabilty;

        totalChargingEvents += expectedArrivals;
        const expectedEnergy = expectedArrivals * averageEnergyUsage;

        totalEnergyConsumed += expectedEnergy;
        usage[day].totalEnergyUsed += expectedEnergy
    }

    const averageDayEnergy = totalEnergyConsumed / actualDays;
    const averageChargingEventsPerDay = totalChargingEvents / actualDays;

    return {
        usage: usage.map((data, index) => ({
            day: index + 1,
            data: {
                totalEnergyUsed: formatNumber(data.totalEnergyUsed)
            }
        })),
        exemplaryDay: {
            sampleDay: {
                totalEnergyUsed: formatNumber(usage[0]?.totalEnergyUsed || 0)
            },
            averageDay: {
                totalEnergyUsed: formatNumber(averageDayEnergy)
            }
        },
        totalEnergyConsumed: formatNumber(totalEnergyConsumed),
        totalChargingEvents: Math.floor(totalChargingEvents),
        averageChargingEvents: {
            perDay: formatNumber(averageChargingEventsPerDay),
            perWeek: formatNumber(averageChargingEventsPerDay * DAYS_PER_WEEK),
            perMonth: formatNumber(averageChargingEventsPerDay * DAYS_PER_WEEK * WEEKS_PER_MONTH),
            perYear: formatNumber(averageChargingEventsPerDay * DAYS_PER_WEEK * WEEKS_PER_MONTH * MONTHS_PER_YEAR)
        }
    };
}