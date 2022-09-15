import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { useMemo, useState } from 'react';

import EntryDateInput from './EntryDateInput';
import RelationshipToHoHInput from './RelationshipToHoHInput';

import GenericTable from '@/components/elements/GenericTable';
import { clientName } from '@/modules/hmis/hmisUtil';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
  useSetHoHMutation,
} from '@/types/gqlTypes';

interface Props {
  currentMembers: HouseholdClientFieldsFragment[];
  clientId: string;
  householdId: string;
}

type MaybeClient = HouseholdClientFieldsFragment['client'] | null;

const EditHouseholdMemberTable = ({
  currentMembers,
  clientId,
  householdId,
}: Props) => {
  const [proposedHoH, setProposedHoH] = useState<MaybeClient>(null);
  const [hoh, setHoH] = useState<MaybeClient>(
    currentMembers.find(
      (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    )?.client || null
  );

  const columns = useMemo(() => {
    return [
      {
        header: '',
        key: 'name',
        width: '30%',
        render: (hc: HouseholdClientFieldsFragment) => clientName(hc.client),
      },

      {
        header: '',
        key: 'entry',
        width: '20%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <EntryDateInput enrollment={hc.enrollment} />
        ),
      },
      {
        header: '',
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
        key: 'HoH',
        width: '10%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <FormControlLabel
            checked={hc.client.id === hoh?.id}
            control={<Radio />}
            componentsProps={{ typography: { variant: 'body2' } }}
            label='HoH'
            onChange={() => {
              setProposedHoH(hc.client);
            }}
          />
        ),
      },
      {
        header: '',
        key: 'action',
        width: '10%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <Button
            size='small'
            variant='outlined'
            color='error'
            disabled={
              hc.client.id === clientId ||
              !hc.enrollment.inProgress ||
              hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
            }
          >
            Remove
          </Button>
        ),
      },
    ];
  }, [clientId, hoh]);

  const [setHoHMutate, { loading, error }] = useSetHoHMutation({
    onCompleted: () => {
      setHoH(proposedHoH);
      setProposedHoH(null);
    },
  });

  const onChangeHoH = useMemo(
    () => () => {
      if (!proposedHoH) return;
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
            <Button variant='outlined' color='secondary' onClick={onChangeHoH}>
              {loading ? 'Updating...' : 'Confirm'}
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
