import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjectsForSelect {
    organizations {
      organizationName
      projects {
        id
        projectName
        projectType
      }
    }
  }
`;
