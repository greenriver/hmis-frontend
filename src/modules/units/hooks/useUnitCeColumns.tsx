import UnitReferralStatus from '@/modules/ce/components/UnitReferralStatus';

import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { UnitTableRowFieldsFragment } from '@/types/gqlTypes';

export const useUnitCeColumns = () => {
  // TODO(7409) - instead of using the global permission, check project-level config
  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  if (!canViewCoordinatedEntry) return [];

  return [
    {
      header: 'Referral Status',
      key: 'referralStatus',
      render: (unit: UnitTableRowFieldsFragment) => (
        <UnitReferralStatus unit={unit} />
      ),
    },
  ];
};
