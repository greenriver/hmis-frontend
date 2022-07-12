import { gql } from '@apollo/client';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
// export const GET_PROJECTS = gql`
//   query GetProjects($projectTypes: [ProjectType!]) {
//     projects(projectTypes: $projectTypes) {
//       id
//       name
//       projectType
//     }
//   }
// `;

export const GET_PROJECTS = gql`
  query GetProjectsForSelect($projectTypes: [ProjectType!]) {
    projectsForSelect(projectTypes: $projectTypes) {
      label
      options {
        label
        value
        projectType
      }
    }
  }
`;
