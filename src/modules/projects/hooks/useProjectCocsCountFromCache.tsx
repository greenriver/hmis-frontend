import { useMemo } from 'react';
import apolloClient from '@/providers/apolloClient';
import { ProjectCocCountFragmentDoc } from '@/types/gqlTypes';

export function useProjectCocsCountFromCache(projectId?: string) {
  return useMemo(
    () =>
      apolloClient.readFragment({
        id: `Project:${projectId}`,
        fragment: ProjectCocCountFragmentDoc,
        fragmentName: 'ProjectCocCount',
      })?.projectCocs?.nodesCount,
    [projectId]
  );
}
