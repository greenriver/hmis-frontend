import { gql } from '@apollo/client';

export const GET_PROJECTS_OLD = gql`
  query GetProjects($projectTypes: [ProjectType!]) {
    projects(projectTypes: $projectTypes) {
      id
      name
      projectType
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjectsForSelect {
    projectsForSelect {
      label
      options {
        label
        value
        projectType
      }
    }
  }
`;
