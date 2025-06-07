## HOW TO RUN

### Installation
Please set up the application by running `npm run setup`. This will install dependences, create the sqlite database, generate prisma client types, and run migrations.

I am using Node v22.10. If you run into any issues, please check that your node version is at least 20.

### Simulation
The simulation can be run using `npm run simulation`. Running it will generate [a json file](./outputs/simulation-output.json) containing the simulation output in the outputs folder.

Running `npm run graph-concurrency-factor` will run the simulation but vary the amount of chargepoints from 1 - 30. This will
not produce a json file output but will create a [png image](./outputs/concurrency-graph.png) in the outputs folder, showing how the concurrency factor behaves as the number of chargepoints changes

### Backend
Running `npm start` will start a RURU GraphQL UI Server on port 4000. By opening that page in the browser, you can query the backend.

I have included sample queries in the [Query Samples section](#query-samples) below for convenience. Just copy and/or modify the query you want into the Ruru UI and click the run button.

## Tech Choices

The application uses NodeJS with Typescript primarily. I'm using [tsx](https://www.npmjs.com/package/tsx) as a typescript runtime.

For the database stack, I am using Prisma. I had originally intended to use
Prisma with Postgres but that might have needed setting up a Docker container to run it. The simpler choice was Sqlite which Prisma
supports of out the box.

The Backend is Express with GraphQL. I'm using [Ruru](https://www.npmjs.com/package/ruru) to serve the GraphQL UI.

I'm using [seedrandom.js](https://www.npmjs.com/package/seedrandom) for deterministic random number generation in the simulation.

## Places of Interest

- [scripts/runConcurrencyFactorGraph.ts](./scripts/runConcurrencyFactorGraph.ts) Contains the Graph Concurrency Factor script
- [scripts/runSimulation.ts](./scripts/runSimulation.ts) Contains the Run Simulation Script
- [src/calculation.ts](./src/calculation.ts) Contains the Simulate and Mock Simulate functions which drive the simulation and backend respectively
- [src/constants.ts](./src/constants.ts) Defines a few constants
- [./prisma/schema.prisma](./prisma/schema.prisma) Defines the Prisma DB Schema
- [./graphql/schema.ts](./graphql/schema.ts) Defines the GraphQL Schema
- [./src/route.ts](./src/route.ts) Defines the resolvers that drive the GraphQL API, including the input validation and db logic
- [./types.ts](./types.ts) Defines a few Custom Types


## Query Samples

<details>
<summary>Create Simulation (Mutation)</summary>

```
mutation {
  simulate(input: {
    chargerCount: 20
    arrivalProbabilityMultiplier: 100
    consumptionPerKmKWH: 0.18
    chargerPowerOutputKW: 11
    totalTicks: 35040
  }) {
    input {
      chargerCount
      arrivalProbabilityMultiplier
      consumptionPerKmKWH
      chargerPowerOutputKW
      totalTicks
    }
    output {
      totalEnergyConsumed
      exemplaryDay {
        sampleDay {
          totalEnergyUsed
        }
        averageDay {
          totalEnergyUsed
        }
      }
      averageChargingEvents {
        perDay
        perWeek
        perMonth
        perYear
      }
      totalChargingEvents
      usage {
        day
        data {
          totalEnergyUsed
        }
      }
    }
  }
}
```
</details>

<details>
<summary>Get all Simulations (Query)</summary>

```
query {
  getSimulations {
    input {
      id
      chargerCount
      arrivalProbabilityMultiplier
      consumptionPerKmKWH
      chargerPowerOutputKW
      totalTicks
    }
    output {
      id
      totalEnergyConsumed
      totalChargingEvents
      averageChargingEvents {
        perDay
        perWeek
        perMonth
        perYear
      }
      exemplaryDay {
        sampleDay {
          totalEnergyUsed
        }
        averageDay {
          totalEnergyUsed
        }
      }
      usage {
        day
        data {
          totalEnergyUsed
        }
      }
    }
  }
}
```
</details>

<details>
<summary>Delete Simulation</summary>

```
mutation {
  deleteSimulation(inputId: 1)
}
```
</details>

The GraphQL Schema is in [graphql/schema.ts](./graphql/schema.ts) if you'd like more details