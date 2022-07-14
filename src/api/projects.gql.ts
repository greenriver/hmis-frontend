import { gql } from '@apollo/client';

export const GET_PROJECTS_OLD = gql`
  query GetProjects($projectTypes: [ProjectType!]) {
    projects(projectTypes: $projectTypes) {
      id
      ProjectName
      ProjectType
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
        ProjectType
      }
    }
  }
`;
