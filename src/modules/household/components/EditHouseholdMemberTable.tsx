import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  CircularProgress,
  FormControlLabel,
  Radio,
  Tooltip,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import RelationshipToHoHInput from './elements/RelationshipToHoHInput';
import { HOUSEHOLD_MEMBER_COLUMNS } from './HouseholdMemberTable';

import { SplitIcon } from '@/components/elements/SemanticIcons';
import GenericTable from '@/components/elements/table/GenericTable';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { BASE_ACTION_COLUMN_DEF } from '@/components/elements/table/tableRowActionUtil';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { clientBriefName, sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import SplitHouseholdDialog from '@/modules/household/components/householdActions/SplitHouseholdDialog';
import {
  getDeleteEnrollmentDisabledAttrs,
  getSplitDisabledAttrs,
} from '@/modules/household/components/householdActions/util';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  ProjectAllFieldsFragment,
  RelationshipToHoH,
  useDeleteEnrollmentMutation,
  useUpdateRelationshipToHoHMutation,
} from '@/types/gqlTypes';

interface Props {
  household: HouseholdFieldsFragment;
  project: Pick<ProjectAllFieldsFragment, 'id' | 'projectName' | 'access'>;
  currentDashboardEnrollmentId?: string;
  refetchHousehold: any;
  loading?: boolean;
}

const EditHouseholdMemberTable = ({
  household,
  project,
  refetchHousehold,
  currentDashboardEnrollmentId,
  loading,
}: Props) => {
  const [proposedHoH, setProposedHoH] =
    useState<HouseholdClientFieldsFragment | null>(null);
  const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);

  const currentMembers = useMemo(
    () =>
      sortHouseholdMembers(
        household.householdClients,
        currentDashboardEnrollmentId
      ),
    [household, currentDashboardEnrollmentId]
  );

  const [hoh, setHoH] = useState<HouseholdClientFieldsFragment | null>(
    currentMembers.find(
      (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    ) || null
  );

  // client to highlight for relationship input
  const [highlight, setHighlight] = useState<string[]>([]);

  const [setHoHMutate, { loading: hohChangeLoading }] =
    useUpdateRelationshipToHoHMutation({
      onCompleted: (data) => {
        if (!data.updateRelationshipToHoH) return;

        if (data.updateRelationshipToHoH.enrollment) {
          // highlight relationship field for non-HOH members
          const members =
            data.updateRelationshipToHoH?.enrollment?.household.householdClients
              .filter(
                (hc) =>
                  hc.relationshipToHoH !== RelationshipToHoH.SelfHeadOfHousehold
              )
              .map((hc) => hc.client.id);
          setHighlight(members || []);
          setProposedHoH(null);
          setErrors(emptyErrorState);
          // refetch, so that all relationships-to-HoH to reload
          refetchHousehold();
        } else if (data.updateRelationshipToHoH.errors.length > 0) {
          const errors = data.updateRelationshipToHoH.errors;
          setErrors(partitionValidations(errors));
        }
      },
      onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
    });

  // If member list has changed, update HoH and clear proposed-HoH status
  useEffect(() => {
    const actualHoH =
      currentMembers.find(
        (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
      ) || null;

    setHoH(actualHoH);
    setProposedHoH((prev) => {
      if (prev && prev === actualHoH) {
        return null;
      }
      return prev;
    });
  }, [currentMembers]);

  const onChangeHoH = useCallback(
    (hc: HouseholdClientFieldsFragment, confirmed = false) => {
      setProposedHoH(hc);
      setHoHMutate({
        variables: {
          input: {
            enrollmentId: hc.enrollment.id,
            relationshipToHoH: RelationshipToHoH.SelfHeadOfHousehold,
            confirmed,
          },
        },
      });
    },
    [setHoHMutate]
  );

  const { renderValidationDialog } = useValidationDialog({
    errorState,
    includeErrors: true,
  });

  const [splitInitiator, setSplitInitiator] =
    useState<HouseholdClientFieldsFragment | null>(null);

  const canSplitHouseholds = project.access.canSplitHouseholds;

  const [deleteEnrollment, { loading: deleteLoading, error: deleteError }] =
    useDeleteEnrollmentMutation({
      onCompleted: () => {
        refetchHousehold();
      },
    });

  const columns = useMemo(() => {
    return [
      HOUSEHOLD_MEMBER_COLUMNS.hohIndicator,
      HOUSEHOLD_MEMBER_COLUMNS.clientName({
        currentEnrollmentId: currentDashboardEnrollmentId,
        linkToProfile: !!currentDashboardEnrollmentId,
      }),
      HOUSEHOLD_MEMBER_COLUMNS.enrollmentPeriod,
      HOUSEHOLD_MEMBER_COLUMNS.dobAge,
      {
        header: (
          <Tooltip title='Head of Household' placement='top' arrow>
            <Box sx={{ width: 'fit-content' }}>HoH</Box>
          </Tooltip>
        ),
        key: 'HoH',
        width: '1%',
        render: (hc: HouseholdClientFieldsFragment) => {
          return (
            <FormControlLabel
              checked={hc.client.id === hoh?.client?.id}
              control={
                hohChangeLoading && proposedHoH === hc ? (
                  <Box display='flex' alignItems='center' sx={{ pl: 1, pr: 2 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <Radio
                    inputProps={{
                      'aria-label': `HoH status for ${clientBriefName(
                        hc.client
                      )}`,
                    }}
                  />
                )
              }
              componentsProps={{ typography: { variant: 'body2' } }}
              label='HoH'
              labelPlacement='end'
              disabled={hohChangeLoading}
              onChange={() => {
                onChangeHoH(hc, false);
              }}
            />
          );
        },
      },
      {
        header: <Box sx={{ pl: 4 }}>Relationship to HoH</Box>,
        width: '25%',
        key: 'relationship',
        render: (hc: HouseholdClientFieldsFragment) => (
          <RelationshipToHoHInput
            variant='excludeHoh'
            enrollmentId={hc.enrollment.id}
            enrollmentLockVersion={hc.enrollment.lockVersion}
            relationshipToHoH={hc.relationshipToHoH}
            onClose={() =>
              setHighlight((old) => old.filter((id) => id !== hc.client.id))
            }
            textInputProps={{
              highlight: highlight.includes(hc.client.id),
              inputProps: {
                'aria-label': `Relationship to HoH for ${clientBriefName(
                  hc.client
                )}`,
              },
            }}
          />
        ),
      },
      HOUSEHOLD_MEMBER_COLUMNS.assignedUnit(currentMembers),
      {
        ...BASE_ACTION_COLUMN_DEF,
        render: (hc: HouseholdClientFieldsFragment) => (
          <TableRowActions
            record={hc}
            recordName={clientBriefName(hc.client)}
            MenuProps={{
              MenuListProps: {
                dense: false,
              },
            }}
            menuActionConfigs={[
              {
                // No extra perm check is required for Delete, because this action only allows removing WIP Enrollments,
                // which only requires Can Edit Enrollments, which is already required for this page
                key: 'remove',
                title: 'Delete Enrollment',
                Icon: DeleteIcon,
                ariaLabel: `Delete ${clientBriefName(hc.client)}'s enrollment'`,
                onClick: () => {
                  deleteEnrollment({
                    variables: {
                      input: {
                        id: hc.enrollment.id,
                      },
                    },
                  });
                },
                ...getDeleteEnrollmentDisabledAttrs({
                  loading: loading || deleteLoading,
                  currentDashboardEnrollmentId,
                  householdClient: hc,
                  householdSize: currentMembers.length,
                }),
              },
              {
                key: 'split',
                title: 'Split → New Household',
                Icon: SplitIcon,
                onClick: () => setSplitInitiator(hc),
                ariaLabel: `Split ${clientBriefName(hc.client)} to new household`,
                ...getSplitDisabledAttrs({
                  canSplitHouseholds,
                  loading: loading || deleteLoading,
                  householdClient: hc,
                  householdSize: currentMembers.length,
                }),
              },
            ]}
          />
        ),
      },
    ];
  }, [
    currentDashboardEnrollmentId,
    currentMembers,
    hoh?.client?.id,
    hohChangeLoading,
    proposedHoH,
    onChangeHoH,
    highlight,
    loading,
    deleteLoading,
    canSplitHouseholds,
    deleteEnrollment,
  ]);

  if (deleteError) throw deleteError;

  return (
    <>
      <SsnDobShowContextProvider>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={currentMembers}
          columns={columns}
          rowSx={() => ({
            // HoH indicator column
            'td:nth-of-type(1)': { px: 0 },
          })}
          loading={loading || deleteLoading}
          loadingVariant='linear'
          tableProps={{
            'aria-label': 'Manage Household',
          }}
        />
      </SsnDobShowContextProvider>
      {renderValidationDialog({
        title: 'Change Head of Household',
        onConfirm: () => proposedHoH && onChangeHoH(proposedHoH, true),
        onCancel: () => {
          setProposedHoH(null);
          setErrors(emptyErrorState);
        },
        loading: hohChangeLoading,
      })}
      {!!splitInitiator && (
        <SplitHouseholdDialog
          donorHousehold={household}
          initiator={splitInitiator}
          open={!!splitInitiator}
          onClose={() => setSplitInitiator(null)}
          project={project}
        />
      )}
    </>
  );
};

export default EditHouseholdMemberTable;
