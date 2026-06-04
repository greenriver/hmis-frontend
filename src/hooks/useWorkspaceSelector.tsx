import { useMemo } from 'react';

import WorkspaceSelect from '@/components/elements/input/WorkspaceSelect';
import useSearchParamsState from '@/hooks/useSearchParamState';
import { useGetWorkspacesQuery, WorkspaceAppliesTo } from '@/types/gqlTypes';

const useWorkspaceSelector = (appliesTo: WorkspaceAppliesTo) => {
  // Fetch all workspaces configured for this usage (WorkspaceAppliesTo)
  const { data, loading, error } = useGetWorkspacesQuery({
    variables: { appliesTo },
  });

  // Slug of currently selected workspace, stored in URL Search Params
  const [{ workspace }, setWorkspaceParams] = useSearchParamsState({
    paramsDefinition: {
      workspace: { type: 'string', default: null },
    },
  });

  const workspaces = useMemo(() => data?.workspaces || [], [data]);

  const selectedWorkspace = useMemo(
    () => workspaces.find((w) => w.slug === workspace),
    [workspace, workspaces]
  );

  const selector =
    workspaces.length > 0 ? (
      <WorkspaceSelect
        selectedWorkspace={selectedWorkspace}
        workspaces={workspaces}
        onChange={(workspaceSlug) => {
          setWorkspaceParams({ workspace: workspaceSlug });
        }}
      />
    ) : null;

  return {
    // All workspaces configured for the current usage (WorkspaceAppliesTo)
    workspaces,
    // The workspace select component (if workspaces exist)
    selector,
    // The project group id of the selected workspace
    selectedProjectGroupId: selectedWorkspace?.projectGroupId,
    loading,
    error,
  };
};

export default useWorkspaceSelector;
