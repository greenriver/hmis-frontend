import { useCallback } from 'react';
import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeOpportunityStatus,
  ProjectAllFieldsFragment,
  UnitFieldsFragment,
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
  getCeActions: (unit: UnitFieldsFragment) => CommonMenuItem[];
} => {
  // TODO(7409) - instead of using the global permission, check project-level config
  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  const [
    markUnitsAvailable,
    { loading: availableLoading, error: availableError },
  ] = useMarkUnitsAvailableMutation();

  const [
    markUnitsUnavailable,
    { loading: unavailableLoading, error: unavailableError },
  ] = useMarkUnitsUnavailableMutation();

  const getCeActions = useCallback(
    (unit: UnitFieldsFragment) => {
      const actions: CommonMenuItem[] = [
        {
          title: 'View Unit Group',
          key: 'viewUnitGroup',
          ariaLabel: `View Unit Group ${unit.unitGroup.name}`,
          to: generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
            projectId: project.id,
            unitGroupId: unit.unitGroup.id,
          }),
        },
      ];
      if (!canViewCoordinatedEntry) return actions;

      if (unit.latestOpportunity) {
        actions.push({
          title: 'View Unit',
          key: 'viewUnit',
          ariaLabel: `View Unit ${unit.id}`,
          to: generateSafePath(ProjectDashboardRoutes.UNIT, {
            projectId: project.id,
            unitId: unit.id,
          }),
        });

        // TODO remove
        actions.push({
          title: 'View Opportunity',
          key: 'viewOpportunity',
          ariaLabel: `View Opportunity for Unit ${unit.id}`,
          to: generateSafePath(ProjectDashboardRoutes.OPPORTUNITY, {
            projectId: project.id,
            opportunityId: unit.latestOpportunity.id,
          }),
        });
      }

      // Opportunity creation is only available if the unit has an associated CE Workflow Template
      const hasWorkflowTemplate = unit.workflowTemplateName;

      if (hasWorkflowTemplate && project.access.canManageUnits) {
        if (unit.latestOpportunity && unit.latestOpportunity.active) {
          // Show this option if the opportunity is active, but disable it if it's locked
          actions.push({
            title: 'Mark as Unavailable for Referrals',
            key: 'markUnavailable',
            ariaLabel: `Mark Unit ${unit.id} as Unavailable for Referrals`,
            onClick: () => {
              markUnitsUnavailable({ variables: { unitIds: [unit.id] } });
            },
            disabled:
              unit.latestOpportunity.status === CeOpportunityStatus.Locked,
            disabledReason:
              'Unit with in-progress referral cannot be marked as unavailable',
          });
        } else {
          actions.push({
            title: 'Mark as Available for Referrals', // hide if unit doesnt belong to a group
            key: 'markAvailable',
            ariaLabel: `Mark Unit ${unit.id} as Available for Referrals`,
            onClick: () => {
              markUnitsAvailable({ variables: { unitIds: [unit.id] } });
            },
          });
        }
      }

      return actions;
    },
    [
      canViewCoordinatedEntry,
      markUnitsAvailable,
      markUnitsUnavailable,
      project.access.canManageUnits,
      project.id,
    ]
  );

  if (availableError) throw availableError;
  if (unavailableError) throw unavailableError;

  return {
    getCeActions,
    loading: availableLoading || unavailableLoading,
  };
};
