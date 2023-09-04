import { ProjectAllFieldsFragment, useGetProjectQuery } from '@/types/gqlTypes';

export function useDetailedProject(projectId?: string) {
  const { data, loading, error } = useGetProjectQuery({
    variables: { id: projectId as string },
    skip: !projectId,
  });

  if (error) throw error;

  const project: ProjectAllFieldsFragment | undefined =
    data?.project || undefined;

  return {
    project,
    loading: loading && !project,
  };
}
