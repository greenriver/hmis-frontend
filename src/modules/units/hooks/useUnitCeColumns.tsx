import ReferralStatusChip from '@/modules/ce/components/ReferralStatusChip';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { UnitFieldsFragment } from '@/types/gqlTypes';

export const useUnitCeColumns = () => {
  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  if (!canViewCoordinatedEntry) return [];

  return [
    {
      header: 'Accepting Referrals?',
      key: 'available',
      render: (unit: UnitFieldsFragment) =>
        unit.acceptingCeReferrals ? 'Yes' : 'No',
    },
    {
      header: 'Referral Status',
      key: 'referralStatus',
      render: (unit: UnitFieldsFragment) => {
        const opportunity = unit.latestOpportunity;
        const referral = opportunity?.referral;

        if (opportunity && !referral) return 'Available for referrals';

        if (referral) return <ReferralStatusChip status={referral.status} />;
      },
    },
  ];
};
