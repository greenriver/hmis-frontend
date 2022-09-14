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
import { parseISO } from 'date-fns';
import { useMemo, useState } from 'react';

import RelationshipToHohSelect from './RelationshipToHohSelect';

import GenericTable from '@/components/elements/GenericTable';
import DatePicker from '@/components/elements/input/DatePicker';
import { clientName } from '@/modules/hmis/hmisUtil';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  currentMembers: HouseholdClientFieldsFragment[];
  clientId: string;
}

const EditHouseholdMemberTable = ({ currentMembers, clientId }: Props) => {
  const [proposedHoH, setProposedHoH] = useState<
    HouseholdClientFieldsFragment['client'] | null
  >(null);

  const hoh = useMemo(
    () =>
      currentMembers.find(
        (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
      )?.client,
    [currentMembers]
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
          // move into custom component with mutation
          <DatePicker
            value={
              hc.enrollment.entryDate ? parseISO(hc.enrollment.entryDate) : null
            }
            disableFuture
            sx={{ width: 200 }}
            onChange={(value) => {
              // TODO mutation
              console.log(value);
            }}
          />
        ),
      },
      {
        header: '',
        width: '25%',
        key: 'relationship',
        render: (hc: HouseholdClientFieldsFragment) => (
          // move into custom component with mutation
          <RelationshipToHohSelect
            value={hc.relationshipToHoH}
            disabled={
              hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
            }
            onChange={(_, selected) => {
              // TODO query
              console.log(selected);
            }}
          />
        ),
      },
      {
        header: '',
        key: 'HoH',
        width: '10%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <FormControlLabel
            checked={
              hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
            }
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
  }, [clientId]);

  return (
    <>
      {proposedHoH && (
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
              onClick={() => {
                console.log('TODO query');
                setProposedHoH(null);
              }}
            >
              Confirm
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
