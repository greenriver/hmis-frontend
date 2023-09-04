import {
  Box,
  CircularProgress,
  FormControlLabel,
  Radio,
  Tooltip,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import RelationshipToHoHInput from './elements/RelationshipToHoHInput';
import RemoveFromHouseholdButton from './elements/RemoveFromHouseholdButton';
import { HOUSEHOLD_MEMBER_COLUMNS } from './HouseholdMemberTable';

import GenericTable from '@/components/elements/table/GenericTable';
import usePrevious from '@/hooks/usePrevious';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
  useUpdateRelationshipToHoHMutation,
} from '@/types/gqlTypes';

interface Props {
  household: HouseholdFieldsFragment;
  currentDashboardClientId?: string;
  refetchHousehold: any;
  loading?: boolean;
}

const EditHouseholdMemberTable = ({
  household,
  refetchHousehold,
  currentDashboardClientId,
  loading,
}: Props) => {
  const [proposedHoH, setProposedHoH] =
    useState<HouseholdClientFieldsFragment | null>(null);
  const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);

  const currentMembers = useMemo(
    () =>
      sortHouseholdMembers(
        household.householdClients,
        currentDashboardClientId
      ),
    [household, currentDashboardClientId]
  );

  const [hoh, setHoH] = useState<HouseholdClientFieldsFragment | null>(
    currentMembers.find(
      (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    ) || null
  );
  const previousMembers =
    usePrevious<HouseholdClientFieldsFragment[]>(currentMembers);

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

  // If new members have beed added highlight their relationship field if it's DNC
  useEffect(() => {
    if (!previousMembers || !currentMembers) return;
    if (previousMembers.length < currentMembers.length) {
      const old = new Set(previousMembers.map((m) => m.client.id));
      const newMembers = currentMembers
        .filter(
          (hc) => hc.relationshipToHoH === RelationshipToHoH.DataNotCollected
        )
        .map((m) => m.client.id)
        .filter((id) => !old.has(id));
      setHighlight((old) => [...old, ...newMembers]);
    }
  }, [previousMembers, currentMembers]);

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

  const columns = useMemo(() => {
    return [
      HOUSEHOLD_MEMBER_COLUMNS.hohIndicator,
      HOUSEHOLD_MEMBER_COLUMNS.clientName({
        currentClientId: currentDashboardClientId,
        linkToProfile: !!currentDashboardClientId,
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
                  <Radio />
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
            enrollmentId={hc.enrollment.id}
            relationshipToHoH={hc.relationshipToHoH}
            onClose={() =>
              setHighlight((old) => old.filter((id) => id !== hc.client.id))
            }
            textInputProps={{ highlight: highlight.includes(hc.client.id) }}
          />
        ),
      },
      HOUSEHOLD_MEMBER_COLUMNS.assignedUnit(currentMembers),
      {
        header: '',
        key: 'action',
        width: '1%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <ClientPermissionsFilter
            id={hc.client.id}
            permissions={['canDeleteEnrollments']}
          >
            <RemoveFromHouseholdButton
              currentDashboardClientId={currentDashboardClientId}
              householdClient={hc}
              onSuccess={refetchHousehold}
              householdSize={currentMembers.length}
            />
          </ClientPermissionsFilter>
        ),
      },
    ];
  }, [
    currentDashboardClientId,
    hoh,
    refetchHousehold,
    onChangeHoH,
    setHighlight,
    hohChangeLoading,
    proposedHoH,
    highlight,
    currentMembers,
  ]);

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
          loading={loading}
          loadingVariant='linear'
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
    </>
  );
};

export default EditHouseholdMemberTable;
