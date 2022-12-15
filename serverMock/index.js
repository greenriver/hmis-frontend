import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { faker } from '@faker-js/faker';
import { JsonFileLoader } from '@graphql-tools/json-file-loader';
import { loadSchema } from '@graphql-tools/load';
import { addMocksToSchema } from '@graphql-tools/mock';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

const app = express();
const schema = await loadSchema('../graphql.schema.json', {
  loaders: [new JsonFileLoader()],
});

const resolvers = (store) => ({
  ClientsPaginated: {
    nodes: (root) => {
      const offset = store.get(root, 'offset');
      const limit = store.get(root, 'limit');
      return store.get(root, 'nodes').slice(offset, offset + limit);
    },
  },
  Query: {
    enrollment: (_, args) => {
      return {
        id: args.id,
      };
    },
    client: (_, args) => {
      return {
        id: args.id,
      };
    },
    // clientSearch: (root, {offset, limit}) => {
    //   // FIXME get refs working
    //   // console.log(root)
    //   // console.log(offset, limit)
    //   // console.log(store.get('Query', 'ROOT', 'clientSearch', 'ClientsPaginated', 'nodes'))
    //   return {
    //     offset: offset,
    //     limit: limit,
    //     // nodes: []
    //   }
    // },
  },
});

const page = {
  offset: 0,
  limit: 10,
  nodesCount: 30,
  nodes: [...new Array(30)],
};

// Mock object
const mocks = {
  Int: () => faker.datatype.number(100),
  Float: () => faker.datatype.float({ max: 100, precision: 0.01 }),
  String: () => faker.animal.cat(),
  ID: () => faker.random.numeric(3),
  ISO8601Date: () => '2022-01-01',
  ISO8601DateTime: () => '2022-01-01T15:14:29.062',
  JsonObject: () => {},
  Client: () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    dob: faker.date.birthdate().toISOString().substring(0, 10),
  }),
  ClientsPaginated: () => page,
  AssessmentDetail: () => ({
    definition: {
      definition: baseAssessment,
    },
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
