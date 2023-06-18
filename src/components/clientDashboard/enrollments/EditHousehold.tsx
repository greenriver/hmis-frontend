import { NetworkStatus } from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Grid, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CommonCard } from '@/components/elements/CommonCard';
import DatePicker from '@/components/elements/input/DatePicker';
import Loading from '@/components/elements/Loading';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import useSafeParams from '@/hooks/useSafeParams';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import { enrollmentName, sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import AddToHouseholdButton from '@/modules/household/components/AddToHouseholdButton';
import AssociatedHouseholdMembers, {
  householdMemberColumns,
} from '@/modules/household/components/AssociatedHouseholdMembers';
import EditHouseholdMemberTable from '@/modules/household/components/EditHouseholdMemberTable';
import RelationshipToHohSelect from '@/modules/household/components/RelationshipToHohSelect';
import { useRecentHouseholdMembers } from '@/modules/household/components/useRecentHouseholdMembers';
import {
  isHouseholdClient,
  RecentHouseholdMember,
} from '@/modules/household/types';
import ClientSearch from '@/modules/search/components/ClientSearch';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  RelationshipToHoH,
  useGetEnrollmentWithHouseholdQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EditHousehold = () => {
  const navigate = useNavigate();
  const { enrollment } = useClientDashboardContext();

  const { clientId, enrollmentId } = useSafeParams() as {
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
    useGetEnrollmentWithHouseholdQuery({
      variables: { id: enrollmentId },
      notifyOnNetworkStatusChange: true,
    });

  const enrollmentLoading = loading && networkStatus !== NetworkStatus.refetch;
  const refetchLoading = loading && networkStatus === NetworkStatus.refetch;

  const anythingLoading =
    recentMembersLoading || enrollmentLoading || !enrollment;

  useScrollToHash(anythingLoading);

  const currentMembers = useMemo(
    () =>
      sortHouseholdMembers(
        data?.enrollment?.household.householdClients,
        clientId
      ),
    [data, clientId]
  );
  const currentMembersMap = useMemo(() => {
    const hc = data?.enrollment?.household.householdClients || [];
    return new Set(hc.map((c) => c.client.id));
  }, [data]);

  // Members to show in "previously associated" table
  const [recentEligibleMembers, setRecentEligibleMembers] =
    useState<RecentHouseholdMember[]>();

  useEffect(() => {
    if (refetchLoading || !recentMembers) return;
    setRecentEligibleMembers(
      recentMembers.filter(({ client }) => !currentMembersMap.has(client.id))
    );
  }, [recentMembers, currentMembersMap, refetchLoading]);

  const navigateToEnrollment = useMemo(
    () => () =>
      navigate(
        generateSafePath(ClientDashboardRoutes.VIEW_ENROLLMENT, {
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
        width: '1%',
        render: (record: ClientFieldsFragment | RecentHouseholdMember) => {
          const client = isHouseholdClient(record) ? record.client : record;
          return (
            <DatePicker
              disabled={currentMembersMap.has(client.id)}
              value={candidateEntryDates[client.id] || new Date()}
              disableFuture
              sx={{ width: 150 }}
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
          );
        },
      },
      {
        header: 'Relationship to HoH',
        key: 'relationship',
        width: '20%',
        render: (record: ClientFieldsFragment | RecentHouseholdMember) => {
          const client = isHouseholdClient(record) ? record.client : record;
          return (
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
          );
        },
      },
      {
        header: '',
        key: 'add',
        width: '10%',
        minWidth: '180px',
        render: (record: ClientFieldsFragment | RecentHouseholdMember) => {
          if (!enrollment) return;
          const client = isHouseholdClient(record) ? record.client : record;
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

  const SEARCH_RESULT_COLUMNS: ColumnDef<
    ClientFieldsFragment | RecentHouseholdMember
  >[] = [...householdMemberColumns, ...addToEnrollmentColumns];

  return (
    <>
      <Grid container spacing={4} sx={{ pb: 10 }}>
        <Grid item xs={12}>
          <Typography variant='h4' sx={{ mb: 2 }}>
            Edit Household
            <Box component='span' fontWeight={400}>
              {` for ${enrollmentName(enrollment)} `} enrollment
            </Box>
          </Typography>
          {currentMembers && (
            <>
              <TitleCard title='Current Household' headerVariant='border'>
                <EditHouseholdMemberTable
                  currentMembers={currentMembers}
                  clientId={clientId}
                  refetch={refetch}
                />
              </TitleCard>
              <Button
                startIcon={<ArrowBackIcon />}
                variant='gray'
                size='small'
                sx={{ mt: 4, mb: 6 }}
                onClick={navigateToEnrollment}
              >
                Back to Enrollment
              </Button>
            </>
          )}
          <Typography variant='h4' sx={{ mb: 2 }} id='add' fontWeight={400}>
            Add Clients to Household
          </Typography>
          {recentEligibleMembers && recentEligibleMembers.length > 0 && (
            <TitleCard
              title='Previously Associated Members'
              headerVariant='border'
              sx={{ mb: 4 }}
            >
              <AssociatedHouseholdMembers
                recentMembers={recentEligibleMembers}
                additionalColumns={addToEnrollmentColumns}
              />
            </TitleCard>
          )}

          <CommonCard title='Client Search'>
            <ClientSearch
              hideInstructions
              hideProject
              hideAdvanced
              cardsEnabled={false}
              pageSize={10}
              wrapperComponent={Box}
              addClientInDialog
              searchResultsTableProps={{
                rowLinkTo: undefined,
                tableProps: { size: 'small' },
                columns: SEARCH_RESULT_COLUMNS,
              }}
            />
          </CommonCard>
        </Grid>
      </Grid>
    </>
  );
};
export default EditHousehold;
