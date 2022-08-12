import { gql } from '@apollo/client';

export const CREATE_CLIENT = gql`
  mutation CreateClient($input: CreateClientInput!) {
    createClient(input: $input) {
      clientMutationId
      client {
        id
        personalId
        ssnSerial
        firstName
        preferredName
        lastName
        dob
        dateUpdated
        dob
      }
      errors {
        type
        attribute
        message
        fullMessage
      }
    }
  }
`;
