import { z } from "zod";

export const SimulationInputSchema = z.object({
    chargerCount: z.number().int().min(1),
    arrivalProbabilityMultiplier: z.number().int().min(0),
    consumptionPerKmKWH: z.number().min(0),
    chargerPowerOutputKW: z.number().min(0),
    totalTicks: z.number().int().min(1),
});

export const DeleteSimulationInputSchema = z.object({
    inputId: z.number().int().positive(),
});