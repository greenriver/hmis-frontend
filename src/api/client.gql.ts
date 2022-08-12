import { gql } from '@apollo/client';

export const GET_CLIENT = gql`
  query GetClient($id: ID!) {
    client(id: $id) {
      id
      personalId
      ssnSerial
      firstName
      preferredName
      lastName
      nameSuffix
      dob
      dateUpdated
      enrollments(limit: 10, offset: 0) {
        nodesCount
        limit
        offset
        nodes {
          id
          entryDate
          exitDate
          project {
            projectName
          }
        }
      }
    }
  }
`;
