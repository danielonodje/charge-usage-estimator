import seedRandom from 'seedrandom';
import { simulate } from '../src/calculation.js';
import { ARRIVAL_MAP, DEMAND_MAP, DEFAULT_DURATION, DEFAULT_CONSUMPTION_PER_KM, 
    DEFAULT_CHARGER_POWER_KW, DEFAULT_CHARGER_COUNT, SIMULATION_OUTPUT_FILE_NAME } from '../src/constants.js';
import { SimulationInput, SimulationOutput } from '../types.js';
import fs from 'fs';

function runSimulation (): void {
    const input: SimulationInput = {
        chargerCount: DEFAULT_CHARGER_COUNT,
        totalTicks: DEFAULT_DURATION,
        consumptionPerKmKWH: DEFAULT_CONSUMPTION_PER_KM,
        chargerPowerOuputKW: DEFAULT_CHARGER_POWER_KW
    }

    // seed rng for deterministic randomness each run
    const rng = seedRandom('correct horse battery staple');
    
    console.log('Starting Simulation');
    const result = simulate(input, ARRIVAL_MAP, DEMAND_MAP, rng);
    writeOutputToFile(SIMULATION_OUTPUT_FILE_NAME, result);
    console.log(`Simulation Complete. Output written to ${SIMULATION_OUTPUT_FILE_NAME}`);
}

function writeOutputToFile(filepath: string, data: SimulationOutput) {
    fs.writeFileSync(filepath, JSON.stringify(data));
}

runSimulation();