import { gql } from '@apollo/client';

export const GET_CLIENTS = gql`
  query GetClients($input: ClientSearchInput!, $limit: Int!, $offset: Int = 0) {
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
      dob
      dateUpdated
      enrollments {
        id
        entryDate
        exitDate
        project {
          projectName
        }
      }
    }
  }
`;
