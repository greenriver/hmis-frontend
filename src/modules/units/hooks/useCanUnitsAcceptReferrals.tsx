import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { UnitGroupDetailFieldsFragment } from '@/types/gqlTypes';

type Args = {
  unitGroup: UnitGroupDetailFieldsFragment;
};

export const useCanUnitsAcceptReferrals = ({ unitGroup }: Args) => {
  // TODO(7409) - instead of using the global permission, this hook should accept project and check project-level config
  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  return (
    canViewCoordinatedEntry && unitGroup.workflowTemplateIdentifier !== null
  );
};
