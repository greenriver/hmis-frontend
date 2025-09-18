import { useCallback } from 'react';
import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  UnitTableRowFieldsFragment,
  useMarkUnitsAvailableMutation,
  useMarkUnitsUnavailableMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const useUnitCeActions = ({
  projectId,
  projectSupportsReferrals,
}: {
  projectId: string;
  projectSupportsReferrals: boolean;
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
      if (!projectSupportsReferrals) return [];

      const actions: CommonMenuItem[] = [];

      // Always allow linking to Unit page, if the project supports CE referrals, to view/manage eligibility criteria
      actions.push({
        title: 'View Unit',
        key: 'viewUnit',
        ariaLabel: `View Unit ${unit.id}`,
        to: generateSafePath(ProjectDashboardRoutes.UNIT, {
          projectId: projectId,
          unitId: unit.id,
        }),
      });

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
      projectSupportsReferrals,
      markUnitsAvailable,
      markUnitsUnavailable,
      projectId,
    ]
  );

  if (availableError) throw availableError;
  if (unavailableError) throw unavailableError;

  return {
    getCeActions,
    loading: availableLoading || unavailableLoading,
  };
};
