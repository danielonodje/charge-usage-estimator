import { ArrivalProbabilities, DemandProbabilities } from "./types.js";

/**
 * Arrival probabilites should sum to 100 percent but they don't
 * they sum to 99.99 percent off by 0.01. We need them to sum
 * to 100 because if they don't our random probability might be
 * larger than anything available and have nothing to map to
 * increasing the probability of a 7 o'clock arrival to 0.095
 * to fill this gap
 */
export const ARRIVAL_MAP: ArrivalProbabilities = {
    0: 0.0094,
    1: 0.0094,
    2: 0.0094,
    3: 0.0094,
    4: 0.0094,
    5: 0.0094,
    6: 0.0094,
    7: 0.0095,
    8: 0.0283,
    9: 0.0283,
    10: 0.0566,
    11: 0.0566,
    12: 0.0566,
    13: 0.0755,
    14: 0.0755,
    15: 0.0755,
    16: 0.1038,
    17: 0.1038,
    18: 0.1038,
    19: 0.0472,
    20: 0.0472,
    21: 0.0472,
    22: 0.0094,
    23: 0.0094
}

/**
 * There was a small issue with the supplied demand probabilites
 * Ideally they should sum to 100 percent but they fell short at
 * 99.97 percent. This could cause an issue where a random probability
 * larger than 99.97 percent cannot be mapped to any distance.
 * I'm fixing this by increasing the probability of getting a distance
 * 0 to 34.34 percent. This fills the mising 0.03 percent removing
 * the bug 
 */
export const DEMAND_MAP: DemandProbabilities = [
    { probability: 0.3434, distance: 0 },
    { probability: 0.0490, distance: 5 },
    { probability: 0.0980, distance: 10 },
    { probability: 0.1176, distance: 20 },
    { probability: 0.0882, distance: 30 },
    { probability: 0.1176, distance: 50 },
    { probability: 0.1078, distance: 100 },
    { probability: 0.0490, distance: 200 },
    { probability: 0.0294, distance: 300 },
];

export const TICKS_PER_DAY = 24 * 4; // 24 hours x 4 ticks, there are four 15 minute segments in an hour and 24 hours in a day
export const ONE_TICK = 0.25; // expresses the length of one tick, 15 minutes in terms of an hour
export const TICKS_PER_HOUR = 4; // expresses how many ticks of 15 minutes exist in an hour
export const DEFAULT_DURATION = 365 * TICKS_PER_DAY; // One year
export const DEFAULT_CHARGER_COUNT = 20;
export const DEFAULT_CHARGER_POWER_KW = 11;
export const DEFAULT_CONSUMPTION_PER_KM = 0.18; // converted 18kwh per 100km to kwh per KM by dividing by 100
export const MAX_CHARGER_COUNT = 30;
export const GRAPH_FILE_NAME = './concurrency-graph.png';
export const GRAPH_FILE_WIDTH = 700;
export const GRAPH_FILE_HEIGHT = 400;