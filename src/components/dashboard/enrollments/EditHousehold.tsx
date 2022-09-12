import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  Typography,
} from '@mui/material';
import { fromPairs } from 'lodash-es';
import { useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import AssociatedHouseholdMembers from './household/AssociatedHouseholdMembers';
import RelationshipToHohSelect from './household/RelationshipToHohSelect';
import { useRecentHouseholdMembers } from './household/useRecentHouseholdMembers';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import GenericTable, { Columns } from '@/components/elements/GenericTable';
import DatePicker from '@/components/elements/input/DatePicker';
import Loading from '@/components/elements/Loading';
import { clientName, enrollmentName } from '@/modules/hmis/hmisUtil';
import ClientSearch, {
  CLIENT_COLUMNS,
} from '@/modules/search/components/ClientSearch';
import { DashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
  useGetEnrollmentWithHoHQuery,
} from '@/types/gqlTypes';

const EditHousehold = () => {
  const navigate = useNavigate();
  const { clientId, enrollmentId } = useParams() as {
    clientId: string;
    enrollmentId: string;
  };
  const [recentMembers, recentMembersLoading] =
    useRecentHouseholdMembers(clientId);

  // map candidate client id -> realtionship-to-hoh
  const [candidateRelationships, setCandidateRelationships] = useState<
    Record<string, RelationshipToHoH | null>
  >({});

  // map candidate client id -> entry date
  const [candidateEntryDates, setCandidateEntryDates] = useState<
    Record<string, Date | null>
  >({});

  const [proposedHoH, setProposedHoH] = useState<
    HouseholdClientFieldsFragment['client'] | null
  >(null);

  const { data, loading: enrollmentLoading } = useGetEnrollmentWithHoHQuery({
    variables: { id: enrollmentId },
  });

  const [crumbs, loading, enrollment] = useEnrollmentCrumbs('Edit Household');

  const currentMembers = useMemo(() => {
    const hc = data?.enrollment?.household.householdClients || [];
    return fromPairs(hc.map((c) => [c.client.id, c.relationshipToHoH]));
  }, [data]);

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

  // don't show people that are already enrolled in this household
  const eligibleMembers = useMemo(
    () => recentMembers?.filter(({ id }) => !(id in currentMembers)),
    [currentMembers, recentMembers]
  );

  const addToEnrollmentColumns = useMemo(() => {
    return [
      {
        header: 'Entry Date',
        key: 'entry',
        width: '20%',
        render: (client: ClientFieldsFragment) => (
          <DatePicker
            disabled={client.id in currentMembers}
            value={candidateEntryDates[client.id] || new Date()}
            disableFuture
            sx={{ width: 200 }}
            onChange={(value) => {
              setCandidateEntryDates((current) => {
                const copy = { ...current };
                if (!value) {
                  copy[client.id] = null;
                } else {
                  copy[client.id] = value;
                }
                return copy;
              });
            }}
          />
        ),
      },
      {
        header: 'Relationship to HoH',
        key: 'relationship',
        width: '20%',
        render: (client: ClientFieldsFragment) => (
          <RelationshipToHohSelect
            disabled={client.id in currentMembers}
            value={candidateRelationships[client.id] || null}
            onChange={(_, selected) => {
              setCandidateRelationships((current) => {
                const copy = { ...current };
                if (!selected) {
                  copy[client.id] = null;
                } else {
                  copy[client.id] = selected.value;
                }
                return copy;
              });
            }}
          />
        ),
      },
      {
        header: '',
        key: 'add',
        render: (client: ClientFieldsFragment) => {
          const disabled = client.id in currentMembers;

          return (
            <Button
              disabled={disabled}
              onClick={() => {
                // FIXME graphql query
                console.log(
                  'add to enrollment',
                  client.id,
                  candidateRelationships[client.id],
                  candidateEntryDates[client.id]
                );
              }}
            >
              {disabled ? 'Added' : 'Add to Enrollment'}
            </Button>
          );
        },
      },
    ];
  }, [candidateEntryDates, candidateRelationships, currentMembers]);

  if (loading || enrollmentLoading) return <Loading />;
  if (!crumbs || !enrollment) throw Error('Enrollment not found');

  const columns: Columns<ClientFieldsFragment>[] = [
    CLIENT_COLUMNS.name,
    CLIENT_COLUMNS.ssn,
    CLIENT_COLUMNS.dobAge,
    ...addToEnrollmentColumns,
  ];

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Grid container spacing={4} sx={{ pb: 10 }}>
        <Grid item xs={11}>
          <Typography variant='h3' sx={{ mb: 2 }}>
            <b>Edit Household</b>
            {` for ${enrollmentName(enrollment)} `} enrollment
          </Typography>
          {recentMembersLoading && <Loading />}

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
                      <b>{clientName(hoh)}</b> to{' '}
                      <b>{clientName(proposedHoH)}</b>
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

          {eligibleMembers && eligibleMembers.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h5' sx={{ mb: 2 }}>
                Add Previously Associated Members
              </Typography>
              <AssociatedHouseholdMembers
                recentMembers={eligibleMembers}
                additionalColumns={addToEnrollmentColumns}
              />
            </Paper>
          )}

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Search for Clients to Add to Enrollment
            </Typography>
            <ClientSearch
              hideInstructions
              cardsEnabled={false}
              wrapperComponent={Box}
              searchResultsTableProps={{
                handleRowClick: undefined,
                tableProps: { size: 'small' },
                columns,
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};
export default EditHousehold;
