import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import AddToHouseholdButton from './household/AddToHouseholdButton';
import AssociatedHouseholdMembers from './household/AssociatedHouseholdMembers';
import EditHouseholdMemberTable from './household/EditHouseholdMemberTable';
import RelationshipToHohSelect from './household/RelationshipToHohSelect';
import { useRecentHouseholdMembers } from './household/useRecentHouseholdMembers';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import { ColumnDef } from '@/components/elements/GenericTable';
import DatePicker from '@/components/elements/input/DatePicker';
import Loading from '@/components/elements/Loading';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import ClientSearch, {
  CLIENT_COLUMNS,
} from '@/modules/search/components/ClientSearch';
import { DashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
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

  // map candidate client id -> relationship-to-hoh
  const [candidateRelationships, setCandidateRelationships] = useState<
    Record<string, RelationshipToHoH | null>
  >({});

  // map candidate client id -> entry date
  const [candidateEntryDates, setCandidateEntryDates] = useState<
    Record<string, Date | null>
  >({});

  const { data, loading, refetch, networkStatus } =
    useGetEnrollmentWithHoHQuery({
      variables: { id: enrollmentId },
      notifyOnNetworkStatusChange: true,
    });
  const enrollmentLoading = loading && networkStatus !== 4;

  const [crumbs, breadcrumbsLoading, enrollment] =
    useEnrollmentCrumbs('Edit Household');

  const currentMembers = useMemo(() => {
    return data?.enrollment?.household.householdClients || [];
  }, [data]);
  const currentMembersMap = useMemo(() => {
    const hc = data?.enrollment?.household.householdClients || [];
    return new Set(hc.map((c) => c.client.id));
  }, [data]);

  // don't show people that are already enrolled in this household
  const eligibleMembers = useMemo(() => {
    return recentMembers?.filter(({ id }) => !currentMembersMap.has(id));
  }, [recentMembers, currentMembersMap]);

  const navigateToEnrollment = useMemo(
    () => () =>
      navigate(
        generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
          clientId,
          enrollmentId,
        })
      ),
    [clientId, enrollmentId, navigate]
  );

  const addToEnrollmentColumns = useMemo(() => {
    return [
      {
        header: 'Entry Date',
        key: 'entry',
        width: '20%',
        render: (client: ClientFieldsFragment) => (
          <DatePicker
            disabled={currentMembersMap.has(client.id)}
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
            disabled={currentMembersMap.has(client.id)}
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
        width: '15%',
        render: (client: ClientFieldsFragment) => {
          if (!enrollment) return;
          return (
            <AddToHouseholdButton
              isMember={currentMembersMap.has(client.id)}
              onSuccess={refetch}
              startDate={candidateEntryDates[client.id]}
              relationshipToHoH={candidateRelationships[client.id]}
              householdId={enrollment?.household.id}
              clientId={client.id}
            />
          );
        },
      },
    ];
  }, [
    candidateEntryDates,
    candidateRelationships,
    currentMembersMap,
    refetch,
    enrollment,
  ]);

  if (breadcrumbsLoading || enrollmentLoading || recentMembersLoading)
    return <Loading />;
  if (!crumbs || !enrollment) throw Error('Enrollment not found');

  const searchResultColumns: ColumnDef<ClientFieldsFragment>[] = [
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
          {currentMembers && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h5' sx={{ mb: 3 }}>
                Current Household
              </Typography>
              <EditHouseholdMemberTable
                currentMembers={currentMembers}
                clientId={clientId}
                householdId={enrollment.household.id}
              />
              <Button
                startIcon={<ArrowBackIcon />}
                variant='gray'
                size='small'
                sx={{ mt: 2 }}
                onClick={navigateToEnrollment}
              >
                Back to Enrollment
              </Button>
            </Paper>
          )}
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
                columns: searchResultColumns,
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};
export default EditHousehold;
