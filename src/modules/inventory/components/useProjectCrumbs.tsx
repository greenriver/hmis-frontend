import { generatePath, useLocation, useParams } from 'react-router-dom';

import apolloClient from '@/providers/apolloClient';
import { Routes } from '@/routes/routes';
import {
  ProjectAllFieldsFragment,
  ProjectAllFieldsFragmentDoc,
  useGetProjectQuery,
} from '@/types/gqlTypes';

export const ALL_PROJECTS_CRUMB = {
  label: 'All Projects & Organizations',
  to: Routes.ALL_PROJECTS,
};

export function useProjectCrumbs(current?: string) {
  const { pathname } = useLocation();
  const { projectId } = useParams() as {
    projectId: string;
  };

  // get project from cache if we have it
  const project = apolloClient.readFragment({
    id: `Project:${projectId}`,
    fragment: ProjectAllFieldsFragmentDoc,
    fragmentName: 'ProjectAllFields',
  });

  const { loading, error } = useGetProjectQuery({
    variables: { id: projectId || '' },
    skip: !!project,
  });

  if (error) throw error;

  const crumbs = project
    ? [
        ALL_PROJECTS_CRUMB,
        {
          label: project.organization.organizationName,
          to: generatePath(Routes.ORGANIZATION, {
            organizationId: project.organization.id,
          }),
        },
        {
          label: project.projectName,
          to: Routes.PROJECT,
        },
        ...(current ? [{ label: current, to: pathname }] : []),
      ]
    : undefined;

  return [crumbs, loading, project] as [
    crumbs: { label: string; to: string }[] | undefined,
    loading: boolean,
    project: ProjectAllFieldsFragment | undefined
  ];
}
