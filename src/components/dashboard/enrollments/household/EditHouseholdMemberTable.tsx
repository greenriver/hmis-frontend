import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Paper,
  Radio,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import RelationshipToHohSelect from './household/RelationshipToHohSelect';

import GenericTable from '@/components/elements/GenericTable';
import { clientName } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

const EditHouseholdMemberTable = ({
  data,
  currentMembers,
  clientId,
  enrollmentId,
}) => {
  const navigate = useNavigate();
  const [proposedHoH, setProposedHoH] = useState<
    HouseholdClientFieldsFragment['client'] | null
  >(null);
  const onRemove = useMemo(
    // TODO mutation to remove household member
    () => (id: string) => console.log('remove', id),
    []
  );
  const hoh = useMemo(
    () =>
      data?.enrollment?.household.householdClients.find(
        (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
      )?.client,
    [data]
  );

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant='h5' sx={{ mb: 3 }}>
        Current Household
      </Typography>
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
      {currentMembers && (
        <GenericTable<HouseholdClientFieldsFragment>
          rows={data?.enrollment?.household.householdClients || []}
          columns={[
            {
              header: '',
              key: 'name',
              width: '40%',
              render: (hc) => clientName(hc.client),
            },
            {
              header: '',
              key: 'relationship',
              render: (hc) => (
                <RelationshipToHohSelect
                  value={hc.relationshipToHoH}
                  disabled={
                    hc.relationshipToHoH ===
                    RelationshipToHoH.SelfHeadOfHousehold
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
              render: (hc: HouseholdClientFieldsFragment) => (
                <FormControlLabel
                  checked={
                    hc.relationshipToHoH ===
                    RelationshipToHoH.SelfHeadOfHousehold
                  }
                  control={<Radio />}
                  componentsProps={{ typography: { variant: 'body2' } }}
                  label='Head of Household'
                  onChange={() => {
                    setProposedHoH(hc.client);
                  }}
                />
              ),
            },
            {
              header: '',
              key: 'action',
              render: (hc) => (
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  disabled={
                    hc.client.id === clientId ||
                    !hc.enrollment.inProgress ||
                    hc.relationshipToHoH ===
                      RelationshipToHoH.SelfHeadOfHousehold
                  }
                  onClick={() => onRemove(hc.client.id)}
                >
                  Remove
                </Button>
              ),
            },
          ]}
        />
      )}
      <Button
        startIcon={<ArrowBackIcon />}
        variant='gray'
        size='small'
        sx={{ mt: 2 }}
        onClick={() =>
          navigate(
            generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
              clientId,
              enrollmentId,
            })
          )
        }
      >
        Back to Enrollment
      </Button>
    </Paper>
  );
};

export default EditHouseholdMemberTable;
