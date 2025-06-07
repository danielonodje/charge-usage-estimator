import { ZodError } from "zod";
import { MockSimulationResult, MockSimulationInput } from "../types.js";
import { mockSimulate } from "./calculation.js";
import { ARRIVAL_MAP, DEMAND_MAP } from "./constants.js";
import { db } from "./db.js";
import { mapToSimulationResult, ValidationError } from "./utils.js";
import { DeleteSimulationInputSchema, SimulationInputSchema } from "./zodSchemas.js";
import { Prisma } from "generated/prisma/client.js";

export default {
    getSimulations: async (): Promise<MockSimulationResult[]> => {
        const data = await db.mockSimulationInput.findMany({
            include: {
                output: true
            }
        });

        return (data || []).map(d => mapToSimulationResult(d));
    },
    simulate: async ({ input }: { input: MockSimulationInput }): Promise<MockSimulationResult> => {

        try {
            const parsedInput = SimulationInputSchema.parse(input);

            const result = mockSimulate(input, ARRIVAL_MAP, DEMAND_MAP);

        const savedInput = await db.mockSimulationInput.create({
            data: parsedInput
        });

        const savedOutput = await db.mockSimulationOutput.create({
            data: {
                inputId: savedInput.id,
                totalEnergyConsumed: result.totalEnergyConsumed,
                totalChargingEvents: result.totalChargingEvents,
                usage: result.usage,
                exemplarySampleDay: result.exemplaryDay.sampleDay,
                exemplaryAverageDay: result.exemplaryDay.averageDay,
                eventsPerDay: result.averageChargingEvents.perDay,
                eventsPerWeek: result.averageChargingEvents.perWeek,
                eventsPerMonth: result.averageChargingEvents.perMonth,
                eventsPerYear: result.averageChargingEvents.perYear
            }
        });

        return {
            input: { id: savedInput.id, ...input, },
            output: { id: savedOutput.id, ...result }
        }
        } catch (error) {
            throw mapError(error);
        }

        
    },
    deleteSimulation: async ({ inputId }: { inputId: number }): Promise<boolean> => {
        try {
            const { inputId: parsedId } = DeleteSimulationInputSchema.parse({ inputId });

            const deleteOutput = db.mockSimulationOutput.delete({ where: { inputId: parsedId } });
            const deleteInput = db.mockSimulationInput.delete({ where: { id: parsedId } });

            await db.$transaction([deleteOutput, deleteInput]);
            return true;
        } catch (error: unknown) {
            throw mapError(error);
        }
    }
}

function mapError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // handle known Prisma DB errors, e.g. unique constraint failure
        console.error('Database error:', error.code, error.message);
        return new Error(`Database error occurred. Operation Failed`);
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        // handle validation error on Prisma client usage
        console.error('Validation error:', error.message);
        return  new Error(`Database Error occured. Invalid save data.`);
      } else if (error instanceof ZodError) {
        const flattened = error.flatten();
        console.error("Validation failed for input:", flattened);
        return new ValidationError('Validation Failed', flattened.fieldErrors);
      } else {
        // other unexpected errors
        console.error('Unknown error occured:', error);
        return new Error('Operation Failed. Unknown Error');
      }
}