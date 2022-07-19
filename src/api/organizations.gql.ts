import { gql } from '@apollo/client';

export const GET_ORGANIZATIONS = gql`
  query GetOrganizationsForSelect {
    organizations {
      organizationName
    }
  }
`;
