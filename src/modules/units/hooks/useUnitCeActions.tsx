import { useCallback } from 'react';
import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  ProjectAllFieldsFragment,
  UnitTableRowFieldsFragment,
  useMarkUnitsAvailableMutation,
  useMarkUnitsUnavailableMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const useUnitCeActions = ({
  project,
}: {
  project: ProjectAllFieldsFragment;
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
      if (!project.coordinatedEntryEnabled) return [];

      const actions: CommonMenuItem[] = [];

      // Always allow linking to Unit page, if CE is enabled, to view/manage eligibility criteria
      actions.push({
        title: 'View Unit',
        key: 'viewUnit',
        ariaLabel: `View Unit ${unit.id}`,
        to: generateSafePath(ProjectDashboardRoutes.UNIT, {
          projectId: project.id,
          unitId: unit.id,
        }),
      });

      // Opportunity creation is only available if the unit has an associated CE Workflow Template
      const hasWorkflowTemplate = unit.workflowTemplateName;

      if (hasWorkflowTemplate && project.access.canManageUnits) {
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
      }

      return actions;
    },
    [markUnitsAvailable, markUnitsUnavailable, project]
  );

  if (availableError) throw availableError;
  if (unavailableError) throw unavailableError;

  return {
    getCeActions,
    loading: availableLoading || unavailableLoading,
  };
};
