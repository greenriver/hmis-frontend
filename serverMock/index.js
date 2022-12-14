import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { faker } from '@faker-js/faker';
import { JsonFileLoader } from '@graphql-tools/json-file-loader';
import { loadSchema } from '@graphql-tools/load';
import { addMocksToSchema } from '@graphql-tools/mock';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import client from './forms/records/client.json' assert { type: 'json' };
import funder from './forms/records/funder.json' assert { type: 'json' };
import inventory from './forms/records/inventory.json' assert { type: 'json' };
import organization from './forms/records/organization.json' assert { type: 'json' };
import project from './forms/records/project.json' assert { type: 'json' };
import project_coc from './forms/records/project_coc.json' assert { type: 'json' };

const definitions = {
  client,
  funder,
  inventory,
  organization,
  project,
  project_coc,
};

const app = express();
const schema = await loadSchema('../graphql.schema.json', {
  loaders: [new JsonFileLoader()],
});

const resolvers = (store) => ({
  Query: {
    formDefinition: (_, args) => ({
      id: faker.random.numeric(3),
      version: 0,
      role: 'RECORD',
      status: 'draft',
      identifier: args.identifier,
      definition: definitions[args.identifier],
    }),
    // clientSearch: (_, {offset, limit}) => {
    //   // FIXME get refs working
    //   return {
    //     offset: offset,
    //     limit: limit,
    //     nodes: []
    //   }
    // },
  },
});

const page = {
  offset: 0,
  limit: 10,
  nodesCount: 10,
  nodes: [...new Array(10)],
};

// Mock object
const mocks = {
  Int: () => faker.datatype.number(100),
  Float: () => faker.datatype.float({ max: 100, precision: 0.01 }),
  String: () => faker.animal.cat(),
  ID: () => faker.random.numeric(3),
  ISO8601Date: () => '2022-01-01',
  ISO8601DateTime: () => '2022-01-01T15:14:29.062',
  Client: () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    dob: faker.date.birthdate().toISOString().substring(0, 10),
  }),
  ClientsPaginated: () => page,
  // Don't mock form definitions
  FormDefinitionJson: () => ({
    item: [],
  }),
  // Explicitly set everything to empty, so they don't get filled in by the scalar mocks
  FormItem: () => ({
    autofillValues: null,
    bounds: null,
    component: null,
    dataCollectedAbout: null,
    disabledDisplay: null,
    enableBehavior: null,
    enableWhen: null,
    fieldName: null,
    helperText: null,
    hidden: null,
    initial: null,
    item: null,
    pickListOptions: null,
    pickListReference: null,
    prefix: null,
    readOnly: null,
    recordType: null,
    repeats: null,
    required: null,
    text: null,
  }),
  PickListOption: () => ({
    label: null,
    groupCode: null,
    groupLabel: null,
    secondaryLabel: null,
    initialSelected: false,
  }),
};

const server = new ApolloServer({
  schema: addMocksToSchema({
    resolvers,
    schema,
    mocks,
    preserveResolvers: true,
    randomizeNullableFields: true,
  }),
  allowBatchedHttpRequests: true,
});

await server.start();

app.use('/hmis/hmis-gql', cors(), bodyParser.json(), expressMiddleware(server));

// Make it act like there's already an active session
app.get('/hmis/user.json', (req, res) => {
  res.json({ email: 'noreply@example.com', name: 'Test User' });
});

const port = 4000;
app.listen(port, () => {
  console.log(`🚀  Server ready at http://localhost:${port}`);
});
