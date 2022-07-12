import { gql } from '@apollo/client';

export const GET_CLIENTS = gql`
  query GetClients($lastName: String) {
    clients(lastName: $lastName) {
      id
      ssn
      firstName
      preferredName
      lastName
      dob
    }
  }
`;
