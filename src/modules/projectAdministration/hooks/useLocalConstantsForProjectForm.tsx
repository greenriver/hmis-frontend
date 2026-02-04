import { AlwaysPresentLocalConstants } from '@/modules/form/util/formUtil';
import { ProjectAllFieldsFragment } from '@/types/gqlTypes';

export const useLocalConstantsForProjectForm = (
  project?: ProjectAllFieldsFragment | null
) => {
  return {
    projectId: project?.id || undefined, // For Project creation, projectId is undefined
    ...AlwaysPresentLocalConstants,
  };
};
