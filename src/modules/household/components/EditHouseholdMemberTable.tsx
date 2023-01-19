import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Radio,
  Tooltip,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import EntryDateInput from './EntryDateInput';
import HohIndicatorTableCell from './HohIndicatorTableCell';
import RelationshipToHoHInput from './RelationshipToHoHInput';
import RemoveFromHouseholdButton from './RemoveFromHouseholdButton';

import ClientName from '@/components/elements/ClientName';
import GenericTable from '@/components/elements/GenericTable';
import usePrevious from '@/hooks/usePrevious';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
  useSetHoHMutation,
} from '@/types/gqlTypes';

interface Props {
  currentMembers: HouseholdClientFieldsFragment[];
  clientId: string;
  householdId: string;
  refetch: any;
}

type MaybeClient = HouseholdClientFieldsFragment['client'] | null;

const EditHouseholdMemberTable = ({
  currentMembers,
  clientId,
  householdId,
  refetch,
}: Props) => {
  const [proposedHoH, setProposedHoH] = useState<MaybeClient>(null);
  const [confirmedHoH, setConfirmedHoH] = useState(false);
  const [hoh, setHoH] = useState<MaybeClient>(
    currentMembers.find(
      (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    )?.client || null
  );
  const previousMembers =
    usePrevious<HouseholdClientFieldsFragment[]>(currentMembers);

  // client to highlight for relationship input
  const [highlight, setHighlight] = useState<string[]>([]);

  const [setHoHMutate, { data, loading, error }] = useSetHoHMutation({
    onCompleted: (data) => {
      // highlight relationship field for non-HOH members
      const members =
        data.setHoHForEnrollment?.enrollment?.household.householdClients
          .filter(
            (hc) =>
              hc.relationshipToHoH !== RelationshipToHoH.SelfHeadOfHousehold
          )
          .map((hc) => hc.client.id);
      setHighlight(members || []);
      // refetch, so that all relationships-to-HoH to reload
      refetch();
    },
  });

  // If there was an error changing HoH, close the dialog.
  // FIXME: get the apollo client to recognize this error, and show it to the user
  useEffect(() => {
    const gqlErrors = data?.setHoHForEnrollment?.errors || [];
    if (gqlErrors.length > 0 || error) {
      console.error(
        'Error setting HoH',
        data?.setHoHForEnrollment?.errors || error
      );
      setProposedHoH(null);
      setConfirmedHoH(false);
    }
  }, [data, error]);

  // If member list has changed, update HoH and clear proposed-HoH status
  useEffect(() => {
    const actualHoH =
      currentMembers.find(
        (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
      )?.client || null;

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
    () => () => {
      if (!proposedHoH) return;
      setConfirmedHoH(true);
      setHoHMutate({
        variables: {
          input: {
            clientId: proposedHoH.id,
            householdId,
          },
        },
      });
    },
    [setHoHMutate, proposedHoH, householdId]
  );

  const columns = useMemo(() => {
    return [
      {
        header: '',
        key: 'indicator',
        width: '1%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <HohIndicatorTableCell householdClient={hc} />
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
          />
        ),
      },
      {
        width: '20%',
        header: 'DOB / Age',
        key: 'dob',
        render: (hc: HouseholdClientFieldsFragment) => (
          <ClientDobAge client={hc.client} />
        ),
      },
      {
        header: <Box sx={{ pl: 4 }}>Entry Date</Box>,
        key: 'entry',
        width: '20%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <EntryDateInput enrollment={hc.enrollment} />
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
            onChange={() => {
              setProposedHoH(hc.client);
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
          <RemoveFromHouseholdButton
            clientId={clientId}
            householdClient={hc}
            onSuccess={refetch}
          />
        ),
      },
    ];
  }, [clientId, hoh, refetch, setHighlight, highlight]);

  return (
    <>
      {proposedHoH && !error && (
        <Dialog open>
          <DialogTitle variant='h5'>Change Head of Household</DialogTitle>
          <DialogContent>
            {proposedHoH && hoh && (
              <DialogContentText>
                You are changing the head of household from{' '}
                <b>{clientBriefName(hoh)}</b> to{' '}
                <b>{clientBriefName(proposedHoH)}</b>
              </DialogContentText>
            )}
            {proposedHoH && !hoh && (
              <DialogContentText>
                Set <b>{clientBriefName(proposedHoH)}</b> as Head of Household.
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button
              variant='outlined'
              color='secondary'
              onClick={onChangeHoH}
              disabled={loading || confirmedHoH}
            >
              {loading || confirmedHoH ? 'Updating...' : 'Confirm'}
            </Button>
            <Button onClick={() => setProposedHoH(null)} variant='gray'>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <GenericTable<HouseholdClientFieldsFragment>
        rows={currentMembers}
        columns={columns}
        rowSx={(hc) => ({
          borderLeft:
            hc.client.id === clientId
              ? (theme) => `3px solid ${theme.palette.secondary.main}`
              : undefined,
          'td:nth-of-type(1)': { px: 0 },
        })}
      />
    </>
  );
};

export default EditHouseholdMemberTable;
