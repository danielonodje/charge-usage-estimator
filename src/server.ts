import { schema } from '../graphql/schema.js';
import { createHandler } from 'graphql-http/lib/use/express';
import express from 'express';
import { ruruHTML } from 'ruru/server'
import dotenv from 'dotenv';
dotenv.config();
import routeHandler from './route.js';
import { GraphQLError } from 'graphql';
import { ValidationError } from './utils.js';

const app = express();

app.get('/', (_, res) => {
    res.type('html');
    res.send(ruruHTML({ endpoint: '/graphql' }));
})

// Create and use the GraphQL handler.
app.use(
    '/graphql',
    createHandler({
        schema: schema,
        rootValue: routeHandler,
        formatError: (error: Readonly<Error | GraphQLError>) => {
            if ('originalError' in error && error.originalError?.name === 'ValidationError') {
                return new GraphQLError(error.message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        validationErrors: (error.originalError as ValidationError).validationErrors,
                    },
                    nodes: error.nodes,
                    source: error.source,
                    positions: error.positions,
                    path: error.path,
                    originalError: error.originalError,
                });
            } else if (error instanceof GraphQLError) {
                return error
            } else {
                return new GraphQLError(error.message);
            }
        }
    }),
);

// Start the server at port
app.listen(4000, () => {
    console.log('Running a GraphQL API server at http://localhost:4000');
});