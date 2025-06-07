import { buildSchema } from "graphql";

export const schema = buildSchema(`
type PowerUsage {
    totalEnergyUsed: Float!
}

type ExemplaryDay {
  sampleDay: PowerUsage!
  averageDay: PowerUsage!
}

type AverageChargingEvents {
  perDay: Float!
  perWeek: Float!
  perMonth: Float!
  perYear: Float!
}

type UsageEntry {
  day: Int!
  data: PowerUsage!
}

type SimulationOutput {
  id: Int!
  usage: [UsageEntry!]!
  exemplaryDay: ExemplaryDay!
  totalEnergyConsumed: Float!
  averageChargingEvents: AverageChargingEvents!
  totalChargingEvents: Float!
}

type SimulationInput {
    id: Int!
    chargerCount: Int!
    arrivalProbabilityMultiplier: Int!
    consumptionPerKmKWH: Float!
    chargerPowerOutputKW: Float!
    totalTicks: Int!
}

type SimulationResult {
    input: SimulationInput!
    output: SimulationOutput
}

input SimulationPayload {
    chargerCount: Int!
    arrivalProbabilityMultiplier: Int!
    consumptionPerKmKWH: Float!
    chargerPowerOutputKW: Float!
    totalTicks: Int!
}

type Mutation {
    simulate(input: SimulationPayload!): SimulationResult!
    deleteSimulation(inputId: Int!): Boolean!
}

type Query {
    getSimulations: [SimulationResult!]!
}
`);