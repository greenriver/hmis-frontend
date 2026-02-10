import { useCallback, useMemo, useState } from 'react';

import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import {
  ChangeRelationshipIcon,
  DeleteIcon,
  GoToIcon,
  OpenInNewIcon,
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
import { useChangeRelationshipToHoh } from '@/modules/household/hooks/useChangeRelationshipToHoh';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
  useDeleteEnrollmentMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Args {
  refetchHousehold: VoidFunction;
  loading?: boolean;
  currentDashboardEnrollmentId?: string;
  currentMembers: HouseholdClientFieldsFragment[];
  project: ManageHouseholdProject;
  household: HouseholdFieldsFragment;
  canEdit?: boolean;
}
export function useHouseholdMenuActions({
  refetchHousehold,
  loading,
  currentDashboardEnrollmentId,
  currentMembers,
  project,
  household,
  canEdit,
}: Args) {
  const [deleteEnrollment, { loading: deleteLoading, error: deleteError }] =
    useDeleteEnrollmentMutation({ onCompleted: () => refetchHousehold() });

  const [splitInitiator, setSplitInitiator] =
    useState<HouseholdClientFieldsFragment | null>(null);

  const { confirmHohDialog, onChangeHoh } = useChangeHoh({ refetchHousehold });

  const hasMultipleHohs = useMemo(
    () =>
      currentMembers.filter(
        (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
      ).length > 1,
    [currentMembers]
  );

  const { changeRelationshipDialog, openChangeRelationshipDialog } =
    useChangeRelationshipToHoh();

  const getRowSecondaryActionConfigs = useCallback(
    (row: HouseholdClientFieldsFragment): CommonMenuItem[] => {
      const isSoleHoh =
        row.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold &&
        !hasMultipleHohs;

      const clientId = row.client.id;
      const enrollmentId = row.enrollment.id;

      // Hold off adding Assessment items now, desired behavior is unclear (open individual intakes, switch Enrollment context, etc?)
      // const assessmentItems = [
      //   {
      //     key: 'intake assessment',
      //     title: 'Intake Assessment',
      //     Icon: IntakeAssessmentIcon as any as SvgIconComponent,
      //     to: generateSafePath(EnrollmentDashboardRoutes.INTAKE, {
      //       clientId,
      //       enrollmentId,
      //     }),
      //     ariaLabel: `Go to ${clientBriefName(row.client)}'s Intake Assessment`,
      //   },
      //   {
      //     key: 'exit assessment',
      //     title: 'Exit',
      //     Icon: ExitAssessmentIcon,
      //     to: generateSafePath(EnrollmentDashboardRoutes.EXIT, {
      //       clientId,
      //       enrollmentId,
      //     }),
      //     ariaLabel: `Go to ${clientBriefName(row.client)}'s Exit Assessment`,
      //     disabled: !!row.enrollment.inProgress,
      //   },
      // ];

      const manageHouseholdItems = canEdit
        ? [
            {
              key: 'assign hoh',
              title: 'Make Head of Household',
              Icon: PersonIcon,
              onClick: () => onChangeHoh(row),
              ariaLabel: `Make ${clientBriefName(row.client)} the Head of Household`,
              disabled: isSoleHoh,
            },
            {
              key: 'change relationship to hoh',
              title: 'Change Relationship',
              Icon: ChangeRelationshipIcon,
              onClick: () => openChangeRelationshipDialog(row),
              ariaLabel: `Change ${clientBriefName(row.client)}'s relationship`,
              disabled: isSoleHoh,
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
            {
              key: 'divider-navigation',
              title: 'divider',
              divider: true,
            },
          ]
        : [];

      const navigationItems = [
        {
          key: 'view enrollment',
          title: 'Go to Client Enrollment',
          Icon: GoToIcon,
          to: generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
            clientId,
            enrollmentId,
          }),
          ariaLabel: `Go to  ${clientBriefName(row.client)}'s Enrollment`,
        },
        {
          key: 'open client profile',
          title: 'Open Client Profile',
          Icon: OpenInNewIcon,
          to: generateSafePath(ClientDashboardRoutes.PROFILE, { clientId }),
          openInNew: true,
          ariaLabel: `Go to  ${clientBriefName(row.client)}'s Client Profile (opens in new tab)`,
        },
      ];

      // No extra perm check is required for Delete, because this action only allows removing WIP Enrollments,
      // which only requires Can Edit Enrollments, which is already required for this page
      const deleteEnrollmentItem = canEdit
        ? [
            {
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
          ]
        : [];

      return [
        ...manageHouseholdItems,
        ...navigationItems,
        ...(deleteEnrollmentItem.length > 0
          ? [
              {
                key: 'divider-delete',
                title: 'divider',
                divider: true,
              },
            ]
          : []),
        ...deleteEnrollmentItem,
      ];
    },
    [
      hasMultipleHohs,
      canEdit,
      project.access.canSplitHouseholds,
      loading,
      deleteLoading,
      currentMembers.length,
      currentDashboardEnrollmentId,
      onChangeHoh,
      openChangeRelationshipDialog,
      deleteEnrollment,
    ]
  );

  const actionDialogs = useMemo(() => {
    if (!canEdit) return null;
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
        {changeRelationshipDialog}
      </>
    );
  }, [
    canEdit,
    splitInitiator,
    household,
    project,
    confirmHohDialog,
    changeRelationshipDialog,
  ]);

  if (deleteError) throw deleteError;

  return {
    getRowSecondaryActionConfigs,
    actionDialogs,
    actionLoading: deleteLoading,
  };
}
