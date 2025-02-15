import { useCallback, useMemo, useState } from 'react';

import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import {
  ChangeRelationshipIcon,
  DeleteIcon,
  PersonIcon,
  SplitIcon,
} from '@/components/elements/SemanticIcons';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import SplitHouseholdDialog from '@/modules/household/components/householdActions/SplitHouseholdDialog';
import {
  getDeleteEnrollmentDisabledAttrs,
  getSplitDisabledAttrs,
} from '@/modules/household/components/householdActions/util';
import { ManageHouseholdProject } from '@/modules/household/components/ManageHousehold';
import { useChangeHoh } from '@/modules/household/hooks/useChangeHoh';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  useDeleteEnrollmentMutation,
} from '@/types/gqlTypes';

interface Args {
  refetchHousehold: VoidFunction;
  loading?: boolean;
  currentDashboardEnrollmentId?: string;
  currentMembers: HouseholdClientFieldsFragment[];
  project: ManageHouseholdProject;
  household: HouseholdFieldsFragment;
}
export function useHouseholdMenuActions({
  refetchHousehold,
  loading,
  currentDashboardEnrollmentId,
  currentMembers,
  project,
  household,
}: Args) {
  const [deleteEnrollment, { loading: deleteLoading, error: deleteError }] =
    useDeleteEnrollmentMutation({ onCompleted: () => refetchHousehold() });

  const [splitInitiator, setSplitInitiator] =
    useState<HouseholdClientFieldsFragment | null>(null);

  const { confirmHohDialog, onChangeHoh } = useChangeHoh({ refetchHousehold });

  // TODO: group menu items into sections
  const getRowSecondaryActionConfigs = useCallback(
    (row: HouseholdClientFieldsFragment): CommonMenuItem[] => {
      return [
        // ASSESSMENTS
        // Intake Assessment
        // Exit
        // CLIENT
        {
          key: 'assign hoh',
          title: 'Make Head of Household',
          Icon: PersonIcon,
          onClick: () => onChangeHoh(row),
          ariaLabel: `Make ${clientBriefName(row.client)} the Head of Household`,
        },
        {
          key: 'change relationship to hoh',
          title: 'Change Relationship',
          Icon: ChangeRelationshipIcon,
          onClick: () => console.error('TODO'),
          ariaLabel: `Change ${clientBriefName(row.client)}'s relationship`,
        },
        {
          key: 'split',
          title: 'Split → New Household',
          Icon: SplitIcon,
          onClick: () => setSplitInitiator(row),
          ariaLabel: `Split ${clientBriefName(row.client)} to new household`,
          ...getSplitDisabledAttrs({
            canSplitHouseholds: project.access.canSplitHouseholds,
            loading: loading || deleteLoading,
            householdClient: row,
            householdSize: currentMembers.length,
          }),
        },
        // NAVIGATION
        // go to client enrollment
        // open client profile
        // DIVIDER
        {
          key: 'divider',
          title: 'divider',
          divider: true,
        },
        {
          // No extra perm check is required for Delete, because this action only allows removing WIP Enrollments,
          // which only requires Can Edit Enrollments, which is already required for this page
          key: 'remove',
          title: 'Delete Enrollment',
          Icon: DeleteIcon,
          ariaLabel: `Delete ${clientBriefName(row.client)}'s enrollment`,
          onClick: () => {
            deleteEnrollment({
              variables: { input: { id: row.enrollment.id } },
            });
          },
          ...getDeleteEnrollmentDisabledAttrs({
            loading: loading || deleteLoading,
            currentDashboardEnrollmentId,
            householdClient: row,
            householdSize: currentMembers.length,
          }),
        },
      ];
    },
    [
      project.access.canSplitHouseholds,
      currentDashboardEnrollmentId,
      currentMembers.length,
      deleteEnrollment,
      deleteLoading,
      loading,
      onChangeHoh,
    ]
  );

  const actionDialogs = useMemo(() => {
    return (
      <>
        {!!splitInitiator && (
          <SplitHouseholdDialog
            donorHousehold={household}
            initiator={splitInitiator}
            open={!!splitInitiator}
            onClose={() => setSplitInitiator(null)}
            project={project}
          />
        )}
        {confirmHohDialog}
      </>
    );
  }, [splitInitiator, household, project, confirmHohDialog]);

  if (deleteError) throw deleteError;

  return {
    getRowSecondaryActionConfigs,
    actionDialogs,
    actionLoading: deleteLoading,
  };
}
