import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { sortBy } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import {
  generatePath,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import AddToHouseholdButton from './household/AddToHouseholdButton';
import AssociatedHouseholdMembers, {
  householdMemberColumns,
} from './household/AssociatedHouseholdMembers';
import EditHouseholdMemberTable from './household/EditHouseholdMemberTable';
import RelationshipToHohSelect from './household/RelationshipToHohSelect';
import { useRecentHouseholdMembers } from './household/useRecentHouseholdMembers';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import { ColumnDef } from '@/components/elements/GenericTable';
import DatePicker from '@/components/elements/input/DatePicker';
import Loading from '@/components/elements/Loading';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import ClientSearch from '@/modules/search/components/ClientSearch';
import { DashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  RelationshipToHoH,
  useGetEnrollmentWithHoHQuery,
} from '@/types/gqlTypes';

const EditHousehold = () => {
  const { pathname, hash, key } = useLocation();
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

  const anythingLoading =
    breadcrumbsLoading || enrollmentLoading || recentMembersLoading;

  useEffect(() => {
    if (!hash || anythingLoading) return;
    setTimeout(() => {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }, 0);
  }, [pathname, hash, key, anythingLoading]);

  const currentMembers = useMemo(() => {
    return sortBy(data?.enrollment?.household.householdClients || [], [
      (c) => c.client.lastName || c.client.id,
    ]);
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
        width: '10%',
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

  if (anythingLoading) return <Loading />;
  if (!crumbs || !enrollment) throw Error('Enrollment not found');

  const searchResultColumns: ColumnDef<ClientFieldsFragment>[] = [
    ...householdMemberColumns,
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
            <>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant='h5' sx={{ mb: 3 }}>
                  Current Household
                </Typography>
                <EditHouseholdMemberTable
                  currentMembers={currentMembers}
                  clientId={clientId}
                  householdId={enrollment.household.id}
                  refetch={refetch}
                />
              </Paper>
              <Button
                startIcon={<ArrowBackIcon />}
                variant='gray'
                size='small'
                sx={{ mb: 6 }}
                onClick={navigateToEnrollment}
              >
                Back to Enrollment
              </Button>
            </>
          )}
          <Typography variant='h3' sx={{ mb: 2 }} id='add'>
            <b>Add Household Members</b>
          </Typography>
          {eligibleMembers && eligibleMembers.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h5' sx={{ mb: 2 }}>
                Previously Associated Members
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
              hideProject
              hideAdvanced
              cardsEnabled={false}
              pageSize={10}
              wrapperComponent={Box}
              searchResultsTableProps={{
                handleRowClick: undefined,
                tableProps: { size: 'small' },
                columns: searchResultColumns,
              }}
            />
          </Paper>
          <Button
            startIcon={<ArrowBackIcon />}
            variant='gray'
            size='small'
            onClick={navigateToEnrollment}
          >
            Back to Enrollment
          </Button>
        </Grid>
      </Grid>
    </>
  );
};
export default EditHousehold;
