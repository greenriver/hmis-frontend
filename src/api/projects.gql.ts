import { gql } from '@apollo/client';

export const GET_PROJECTS = gql`
  query GetProjectsForSelect {
    projects(sortOrder: ORGANIZATION_AND_NAME) {
      id
      projectName
      projectType
      organization {
        organizationName
      }
    }
  }
`;
