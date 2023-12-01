import { Grid } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import useAddToHouseholdColumns from '../hooks/useAddToHouseholdColumns';
import { useRecentHouseholdMembers } from '../hooks/useRecentHouseholdMembers';

import EditHouseholdMemberTable from './EditHouseholdMemberTable';
import AddNewClientButton from './elements/AddNewClientButton';
import { CommonCard } from '@/components/elements/CommonCard';
import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import AssociatedHouseholdMembers, {
  householdMemberColumns,
} from '@/modules/household/components/AssociatedHouseholdMembers';
import { RecentHouseholdMember } from '@/modules/household/types';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import ClientTextSearchForm from '@/modules/search/components/ClientTextSearchForm';
import {
  ClientFieldsFragment,
  ClientSearchInput,
  ClientSortOption,
  EnrollmentFieldsFragment,
  ExternalIdentifierType,
  SearchClientsDocument,
  SearchClientsQuery,
  SearchClientsQueryVariables,
} from '@/types/gqlTypes';

interface Props {
  householdId?: string;
  projectId: string;
  BackButton?: ReactNode;
}

const ManageHousehold = ({
  householdId: initialHouseholdId,
  projectId,
  BackButton,
}: Props) => {
  const { globalFeatureFlags } = useHmisAppSettings();
  // This may be rendered either on the Project Dashboard or the Enrollment Dashboard. If on the Enrollment Dash, we need to treat the "current" client differently.
  const enrollmentContext = useEnrollmentDashboardContext();
  const currentDashboardClientId = enrollmentContext?.client?.id;
  const currentDashboardEnrollmentId = enrollmentContext?.enrollment?.id;

  const {
    addToEnrollmentColumns,
    refetchHousehold,
    household,
    onHouseholdIdChange,
    loading,
    householdId,
  } = useAddToHouseholdColumns({
    householdId: initialHouseholdId,
    projectId,
  });

  // Fetch members to show in "previously associated" table
  const [recentMembers, recentMembersLoading] = useRecentHouseholdMembers(
    currentDashboardClientId
  );
  const [recentEligibleMembers, setRecentEligibleMembers] =
    useState<RecentHouseholdMember[]>();

  useEffect(() => {
    if (!currentDashboardClientId) return;
    if (loading || !recentMembers) return;

    const hc = household?.householdClients || [];
    const currentMembersMap = new Set(hc.map((c) => c.client.id));

    setRecentEligibleMembers(
      recentMembers.filter(({ client }) => !currentMembersMap.has(client.id))
    );
  }, [currentDashboardClientId, recentMembers, household, loading]);

  useScrollToHash(loading || recentMembersLoading);

  const columns: ColumnDef<ClientFieldsFragment | RecentHouseholdMember>[] =
    useMemo(() => {
      const defaults = [...householdMemberColumns, ...addToEnrollmentColumns];
      if (globalFeatureFlags?.mciId) {
        return [
          externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID'),
          ...defaults,
        ];
      }
      return defaults;
    }, [addToEnrollmentColumns, globalFeatureFlags?.mciId]);

  const handleNewClientAdded = useCallback(
    (data: EnrollmentFieldsFragment) => {
      if (data.householdId !== householdId) {
        onHouseholdIdChange(data.householdId);
      } else {
        refetchHousehold();
      }
    },
    [householdId, onHouseholdIdChange, refetchHousehold]
  );

  const [searchInput, setSearchInput] = useState<ClientSearchInput>();
  const [hasSearched, setHasSearched] = useState(false);

  if (initialHouseholdId && !household && loading) {
    return <Loading />;
  }

  return (
    <Stack gap={4}>
      {!household && loading && <Loading />}
      {!household && !loading && (
        <CommonCard
          sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}
        >
          No Members, Search to Add Clients
        </CommonCard>
      )}
      {household && (
        <TitleCard
          title='Current Household'
          headerVariant='border'
          data-testid='editHouseholdMemberTable'
        >
          <EditHouseholdMemberTable
            household={household}
            currentDashboardEnrollmentId={currentDashboardEnrollmentId}
            refetchHousehold={refetchHousehold}
            loading={loading}
            projectId={projectId}
          />
        </TitleCard>
      )}
      {BackButton}
      {recentEligibleMembers && recentEligibleMembers.length > 0 && (
        <>
          <TitleCard
            title='Previously Associated Members'
            headerVariant='border'
          >
            <AssociatedHouseholdMembers
              recentMembers={recentEligibleMembers}
              additionalColumns={addToEnrollmentColumns}
            />
          </TitleCard>
        </>
      )}

      <CommonCard title='Client Search'>
        <Stack gap={6}>
          <Grid container alignItems={'flex-start'}>
            <Grid item xs={12} md={9} lg={8}>
              <ClientTextSearchForm
                onSearch={(text) => setSearchInput({ textSearch: text })}
                searchAdornment
                minChars={3}
              />
            </Grid>
            <Grid item xs></Grid>
            <Grid item xs={12} md={3}>
              {hasSearched && (
                <RootPermissionsFilter permissions='canEditClients'>
                  <AddNewClientButton
                    projectId={projectId}
                    householdId={householdId}
                    onCompleted={handleNewClientAdded}
                  />
                </RootPermissionsFilter>
              )}
            </Grid>
          </Grid>

          {searchInput && (
            <SsnDobShowContextProvider>
              <GenericTableWithData<
                SearchClientsQuery,
                SearchClientsQueryVariables,
                ClientFieldsFragment
              >
                queryVariables={{ input: searchInput }}
                queryDocument={SearchClientsDocument}
                columns={columns}
                pagePath='clientSearch'
                fetchPolicy='cache-and-network'
                showFilters
                recordType='Client'
                filterInputType='ClientFilterOptions'
                defaultSortOption={ClientSortOption.BestMatch}
                onCompleted={() => setHasSearched(true)}
              />
            </SsnDobShowContextProvider>
          )}
        </Stack>
      </CommonCard>
    </Stack>
  );
};
export default ManageHousehold;
