import { useCallback } from 'react';
import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  ProjectCoordinatedEntryFeatures,
  UnitTableRowFieldsFragment,
  useMarkUnitsAvailableMutation,
  useMarkUnitsUnavailableMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const useUnitCeActions = ({
  projectId,
  coordinatedEntryFeatures,
}: {
  projectId: string;
  coordinatedEntryFeatures: Partial<ProjectCoordinatedEntryFeatures>;
}): {
  loading: boolean;
  getCeActions: (unit: UnitTableRowFieldsFragment) => CommonMenuItem[];
} => {
  const [
    markUnitsAvailable,
    { loading: availableLoading, error: availableError },
  ] = useMarkUnitsAvailableMutation();

  const [
    markUnitsUnavailable,
    { loading: unavailableLoading, error: unavailableError },
  ] = useMarkUnitsUnavailableMutation();

  const getCeActions = useCallback(
    (unit: UnitTableRowFieldsFragment) => {
      if (!coordinatedEntryFeatures.supportsReferrals) return [];

      const actions: CommonMenuItem[] = [];

      // Only allow linking to the Unit page, if the project supports CE waitlist-based referrals. In the future
      // we may want to expand this if we add more functionality to this page that is relevant to Direct-referral projects.
      if (coordinatedEntryFeatures.supportsWaitlistReferrals) {
        actions.push({
          title: 'View Unit',
          key: 'viewUnit',
          ariaLabel: `View Unit ${unit.id}`,
          to: generateSafePath(ProjectDashboardRoutes.UNIT, {
            projectId: projectId,
            unitId: unit.id,
          }),
        });
      }

      // Note: canBeMarkedAvailableToday will be false if there is no workflow template configured
      if (unit.canBeMarkedAvailableToday) {
        // TODO(#7537) - use canBeMarkedAvailable and implement a confirmation modal enabling the user to specify the "available on date".
        actions.push({
          title: 'Start Accepting Referrals',
          key: 'markAvailable',
          ariaLabel: `Start Accepting Referrals for ${unit.id}`,
          onClick: () => {
            markUnitsAvailable({ variables: { unitIds: [unit.id] } });
          },
        });
      }

      if (unit.canBeMarkedUnavailable) {
        actions.push({
          title: 'Stop Accepting Referrals',
          key: 'markUnavailable',
          ariaLabel: `Stop Accepting Referrals for ${unit.id}`,
          onClick: () => {
            markUnitsUnavailable({ variables: { unitIds: [unit.id] } });
          },
        });
      }

      return actions;
    },
    [
      coordinatedEntryFeatures,
      projectId,
      markUnitsAvailable,
      markUnitsUnavailable,
    ]
  );

  if (availableError) throw availableError;
  if (unavailableError) throw unavailableError;

  return {
    getCeActions,
    loading: availableLoading || unavailableLoading,
  };
};
