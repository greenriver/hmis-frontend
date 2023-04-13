import {
  Box,
  FormControlLabel,
  Radio,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import RelationshipToHoHInput from './RelationshipToHoHInput';
import RemoveFromHouseholdButton from './RemoveFromHouseholdButton';

import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import EnrollmentStatus from '@/components/elements/EnrollmentStatus';
import GenericTable from '@/components/elements/GenericTable';
import usePrevious from '@/hooks/usePrevious';
import ClientName from '@/modules/client/components/ClientName';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
  useUpdateRelationshipToHoHMutation,
} from '@/types/gqlTypes';

interface Props {
  currentMembers: HouseholdClientFieldsFragment[];
  clientId: string;
  refetch: any;
}

const EditHouseholdMemberTable = ({
  currentMembers,
  clientId,
  refetch,
}: Props) => {
  const [proposedHoH, setProposedHoH] =
    useState<HouseholdClientFieldsFragment | null>(null);
  const [confirmedHoH, setConfirmedHoH] = useState(false);
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);
  const [hoh, setHoH] = useState<HouseholdClientFieldsFragment | null>(
    currentMembers.find(
      (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    ) || null
  );
  const previousMembers =
    usePrevious<HouseholdClientFieldsFragment[]>(currentMembers);

  // client to highlight for relationship input
  const [highlight, setHighlight] = useState<string[]>([]);

  const [setHoHMutate, { loading }] = useUpdateRelationshipToHoHMutation({
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
        setConfirmedHoH(false);
        // refetch, so that all relationships-to-HoH to reload
        refetch();
      } else if (data.updateRelationshipToHoH.errors.length > 0) {
        const errors = data.updateRelationshipToHoH.errors;
        setErrors(partitionValidations(errors));
        setConfirmedHoH(false);
      }
    },
    onError: (apolloError) => {
      setConfirmedHoH(false);
      setErrors({ ...emptyErrorState, apolloError });
    },
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
        // HoH change has completed successfully
        setConfirmedHoH(false);
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

  const onChangeHoH = useMemo(
    () =>
      (confirmed = false) => {
        if (!proposedHoH) return;
        setConfirmedHoH(true);
        setHoHMutate({
          variables: {
            input: {
              enrollmentId: proposedHoH.enrollment.id,
              relationshipToHoH: RelationshipToHoH.SelfHeadOfHousehold,
              confirmed,
            },
          },
        });
      },
    [setHoHMutate, proposedHoH]
  );

  const allInProgress = useMemo(
    () => !currentMembers.find((hc) => !hc.enrollment.inProgress),
    [currentMembers]
  );

  const columns = useMemo(() => {
    return [
      {
        header: '',
        key: 'indicator',
        width: '1%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <HohIndicator relationshipToHoh={hc.relationshipToHoH} />
        ),
      },
      {
        header: 'Name',
        key: 'name',
        width: '20%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <ClientName
            client={hc.client}
            routerLinkProps={{ target: '_blank' }}
            linkToProfile={hc.client.id !== clientId}
            bold={hc.client.id === clientId}
          />
        ),
      },
      {
        header: 'Enrollment Period',
        key: 'status',
        width: '20%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <EnrollmentStatus
            enrollment={hc.enrollment}
            activeColor='text.primary'
            closedColor='text.primary'
            hideIcon
            withActiveRange
          />
        ),
      },
      {
        width: '15%',
        header: 'DOB / Age',
        key: 'dob',
        render: (hc: HouseholdClientFieldsFragment) => (
          <ClientDobAge client={hc.client} reveal />
        ),
      },
      {
        header: (
          <Tooltip title='Head of Household' placement='top' arrow>
            <Box sx={{ width: 'fit-content' }}>HoH</Box>
          </Tooltip>
        ),
        key: 'HoH',
        width: '1%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <FormControlLabel
            checked={hc.client.id === hoh?.id}
            control={<Radio />}
            componentsProps={{ typography: { variant: 'body2' } }}
            label='HoH'
            labelPlacement='end'
            disabled={
              // Can't set exited member to HoH
              !!hc.enrollment.exitDate ||
              // Can't set WIP member to HoH (unless ALL members are WIP)
              (hc.enrollment.inProgress && !allInProgress)
              // TODO: Can't set child to HoH?
            }
            onChange={() => {
              setProposedHoH(hc);
            }}
          />
        ),
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
              clientId={clientId}
              householdClient={hc}
              onSuccess={refetch}
            />
          </ClientPermissionsFilter>
        ),
      },
    ];
  }, [clientId, hoh, refetch, setHighlight, highlight, allInProgress]);

  return (
    <>
      {proposedHoH && (
        <ConfirmationDialog
          open
          title='Change Head of Household'
          confirmText='Confirm Change'
          // TODO: support confirmation warnings
          onConfirm={() => onChangeHoH(true)}
          onCancel={() => {
            setProposedHoH(null);
            setErrors(emptyErrorState);
          }}
          loading={loading || confirmedHoH}
          errors={errors}
          color='error'
        >
          <>
            {proposedHoH && hoh && (
              <Typography>
                You are changing the head of household from{' '}
                <b>{clientBriefName(hoh.client)}</b> to{' '}
                <b>{clientBriefName(proposedHoH.client)}</b>
              </Typography>
            )}
            {proposedHoH && !hoh && (
              <Typography>
                Set <b>{clientBriefName(proposedHoH.client)}</b> as Head of
                Household.
              </Typography>
            )}
          </>
        </ConfirmationDialog>
      )}

      <GenericTable<HouseholdClientFieldsFragment>
        rows={currentMembers}
        columns={columns}
        rowSx={() => ({
          // HoH indicator column
          'td:nth-of-type(1)': { px: 0 },
        })}
      />
    </>
  );
};

export default EditHouseholdMemberTable;
