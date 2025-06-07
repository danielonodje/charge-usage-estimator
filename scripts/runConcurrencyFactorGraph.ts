import seedRandom from 'seedrandom';
import { simulate } from '../src/calculation.js';
import { ARRIVAL_MAP, DEMAND_MAP, DEFAULT_DURATION, DEFAULT_CONSUMPTION_PER_KM, DEFAULT_CHARGER_POWER_KW, MAX_CHARGER_COUNT, GRAPH_FILE_NAME, GRAPH_FILE_WIDTH, GRAPH_FILE_HEIGHT } from '../src/constants.js';
import { SimulationInput, SimulationOutput } from '../types.js';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import fs from 'fs';

export async function graphConcurrencyFactor(): Promise<void> {
    const outputs: SimulationOutput[] = [];
    const concurrencyFactors: number[] = [];

    console.log('Plotting Concurrency Factor Graph');

    for (let i = 1; i <= MAX_CHARGER_COUNT; i++) {
        const input: SimulationInput = {
            chargerCount: i,
            totalTicks: DEFAULT_DURATION,
            consumptionPerKmKWH: DEFAULT_CONSUMPTION_PER_KM,
            chargerPowerOuputKW: DEFAULT_CHARGER_POWER_KW
        }

        // seed rng for deterministic randomness each run
        const rng = seedRandom(`colourless green ideas sleep furiously_${i}`);

        const result = simulate(input, ARRIVAL_MAP, DEMAND_MAP, rng);

        outputs.push(result);
        concurrencyFactors.push(result.concurrencyFactor);
    }

    const labels = Array.from({ length: concurrencyFactors.length }, (_, i) => `${i + 1} Chargepoint(s)`);

    await writeGraphToFile(GRAPH_FILE_NAME, labels, concurrencyFactors);

    console.log(`Plotting complete. Image written to ${GRAPH_FILE_NAME}`);

    console.dir(concurrencyFactors);
}

async function writeGraphToFile(filepath: string, labels: string[], values: number[]): Promise<void> {
    const configuration = {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Concurrency Factor',
                data: values,
                borderColor: 'blue'
            }]
        },
        plugins: [{
            id: 'customBackGroundColour',
            // ChartJSNodeCanvas doesn't export the type information for this
            // @ts-expect-error type not available
            beforeDraw: (chart) => {
                const ctx = chart.canvas.getContext('2d');
                ctx.save();
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        }]
    }

    const width = GRAPH_FILE_WIDTH;
    const height = GRAPH_FILE_HEIGHT;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    // slight mistyping with ChartJSNodeCanvas library here, it doesn't accept
    // 'line' as a valid type property but it should, so we'll ignore the error.
    // @ts-expect-error type information incorrect
    const image = await chartJSNodeCanvas.renderToBuffer(configuration);
    fs.writeFileSync(filepath, image);
}

await graphConcurrencyFactor();