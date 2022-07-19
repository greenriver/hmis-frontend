import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjectsForSelect {
    projects {
      id
      projectName
      projectType
      organization {
        organizationName
      }
    }
  }
`;
