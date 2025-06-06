import seedRandom from 'seedrandom';
import { simulate } from './calculation.js';
import { ARRIVAL_MAP, DEMAND_MAP, DEFAULT_DURATION, DEFAULT_CONSUMPTION_PER_KM, DEFAULT_CHARGER_POWER_KW, MAX_CHARGER_COUNT, DEFAULT_CHARGER_COUNT } from './constants.js';
import { SimulationInput } from './types.js';

function runSimulation (): void {
    const input: SimulationInput = {
        chargerCount: DEFAULT_CHARGER_COUNT,
        totalTicks: DEFAULT_DURATION,
        consumptionPerKmKWH: DEFAULT_CONSUMPTION_PER_KM,
        chargerPowerOuputKW: DEFAULT_CHARGER_POWER_KW
    }

    // seed rng for deterministic randomness each run
    const rng = seedRandom(`SEED_CONSTANT`); 

    const result = simulate(input, ARRIVAL_MAP, DEMAND_MAP, rng);
    console.dir(result);
}

runSimulation();