import { AlwaysPresentLocalConstants } from '@/modules/form/util/formUtil';
import { ProjectAllFieldsFragment } from '@/types/gqlTypes';

export const useLocalConstantsForProjectForm = (
  project?: ProjectAllFieldsFragment | null
) => {
  if (!project) {
    // For Project creation, projectId is undefined
    return {
      ...AlwaysPresentLocalConstants,
    };
  }

  return {
    projectId: project.id,
    ...AlwaysPresentLocalConstants,
  };
};
