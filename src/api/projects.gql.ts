import { gql } from '@apollo/client';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
export const GET_PROJECTS = gql`
  query GetProjects {
    projects(projectTypes: [ES]) {
      id
      name
      projectType
    }
  }
`;
