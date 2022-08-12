import { gql } from '@apollo/client';

export const GET_CLIENTS = gql`
  query GetClients($input: ClientSearchInput!, $limit: Int, $offset: Int) {
    clientSearch(input: $input, limit: $limit, offset: $offset) {
      offset
      limit
      nodesCount
      nodes {
        id
        personalId
        ssnSerial
        firstName
        preferredName
        lastName
        nameSuffix
        dob
        dateUpdated
      }
    }
  }
`;
