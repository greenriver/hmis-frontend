import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import EntryDateInput from './EntryDateInput';
import RelationshipToHoHInput from './RelationshipToHoHInput';
import RemoveFromHouseholdButton from './RemoveFromHouseholdButton';

import GenericTable from '@/components/elements/GenericTable';
import { clientInitials, clientName } from '@/modules/hmis/hmisUtil';
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

  const [setHoHMutate, { data, loading, error }] = useSetHoHMutation({
    // refetch, so that all relationships-to-HoH to reload
    onCompleted: () => refetch(),
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
        key: 'thumbnail',
        width: '1%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <Avatar alt='client'>{clientInitials(hc.client)}</Avatar>
        ),
      },
      {
        header: 'Name',
        key: 'name',
        width: '20%',
        render: (hc: HouseholdClientFieldsFragment) => clientName(hc.client),
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
        header: 'Head of Household',
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
          />
        ),
      },
      {
        header: '',
        key: 'action',
        width: '10%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <RemoveFromHouseholdButton
            enrollmentId={hc.enrollment.id}
            disabled={
              hc.client.id === clientId ||
              !hc.enrollment.inProgress ||
              hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
            }
            onSuccess={refetch}
          />
        ),
      },
    ];
  }, [clientId, hoh, refetch]);

  return (
    <>
      {proposedHoH && !error && (
        <Dialog open>
          <DialogTitle variant='h5'>Change Head of Household</DialogTitle>
          <DialogContent>
            {proposedHoH && hoh && (
              <DialogContentText>
                You are changing the head of household from{' '}
                <b>{clientName(hoh)}</b> to <b>{clientName(proposedHoH)}</b>
              </DialogContentText>
            )}
            {proposedHoH && !hoh && (
              <DialogContentText>
                Set <b>{clientName(proposedHoH)}</b> as Head of Household.
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
      />
    </>
  );
};

export default EditHouseholdMemberTable;
