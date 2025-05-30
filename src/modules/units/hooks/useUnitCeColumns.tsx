import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { CeReferralStatus, UnitFieldsFragment } from '@/types/gqlTypes';

export const useUnitCeColumns = () => {
  // TODO(7409) - instead of using the global permission, check project-level config
  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  if (!canViewCoordinatedEntry) return [];

  return [
    // {
    //   header: 'Accepting Referrals?',
    //   key: 'available',
    //   render: (unit: UnitFieldsFragment) =>
    //     unit.acceptingCeReferrals ? 'Yes' : 'No',
    // },
    {
      header: 'Referral Status',
      key: 'ceStatus',
      render: (unit: UnitFieldsFragment) => {
        const opportunity = unit.latestOpportunity;
        const referral = opportunity?.referral;

        if (unit.acceptingCeReferrals) {
          return 'Accepting Referrals';
        }

        if (referral && referral.status === CeReferralStatus.InProgress) {
          return 'Referral In Progress';
        }

        return 'Not Accepting Referrals';
      },
    },
  ];
};
