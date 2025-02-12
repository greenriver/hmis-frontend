import { Grid, Paper } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import useAddToHouseholdColumns from '../hooks/useAddToHouseholdColumns';
import { useRecentHouseholdMembers } from '../hooks/useRecentHouseholdMembers';

import EditHouseholdMemberTable from './EditHouseholdMemberTable';
import AddNewClientButton from './elements/AddNewClientButton';
import CommonCollapsibleCard from '@/components/elements/CommonCollapsibleCard';
import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import { getViewClientMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { useFilters } from '@/modules/hmis/filterUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import AssociatedHouseholdMembers from '@/modules/household/components/AssociatedHouseholdMembers';
import { RecentHouseholdMember } from '@/modules/household/types';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import ClientTextSearchForm from '@/modules/search/components/ClientTextSearchForm';
import {
  ClientSearchInput,
  ClientSearchResultFieldsFragment,
  ClientSortOption,
  EnrollmentFieldsFragment,
  ExternalIdentifierType,
  ProjectAccessFieldsFragment,
  ProjectAllFieldsFragment,
  SearchClientsDocument,
  SearchClientsQuery,
  SearchClientsQueryVariables,
} from '@/types/gqlTypes';

export type ManageHouseholdProject = Pick<
  ProjectAllFieldsFragment,
  'id' | 'projectName'
> & {
  access: Pick<ProjectAccessFieldsFragment, 'canSplitHouseholds'>;
};

interface Props {
  householdId?: string;
  project: ManageHouseholdProject;
  BackButton?: ReactNode;
  renderBackButton?: (householdId?: string) => ReactNode;
  onFirstMemberAdded?: (householdId: string) => void;
}

const ManageHousehold = ({
  householdId,
  project,
  BackButton,
  renderBackButton,
  onFirstMemberAdded,
}: Props) => {
  const { globalFeatureFlags } = useHmisAppSettings();
  // This may be rendered either on the Project Dashboard or the Enrollment Dashboard. If on the Enrollment Dash, we need to treat the "current" client differently.
  const enrollmentContext = useEnrollmentDashboardContext();
  const currentDashboardClientId = enrollmentContext?.client?.id;
  const currentDashboardEnrollmentId = enrollmentContext?.enrollment?.id;

  const onSuccess = useCallback(
    (newHouseholdId: string) => {
      if (!householdId && onFirstMemberAdded) {
        console.log('RELOAD TO', newHouseholdId);
        onFirstMemberAdded(newHouseholdId);
      }
    },
    [householdId, onFirstMemberAdded]
  );
  const { addToEnrollmentColumns, refetchHousehold, household, loading } =
    useAddToHouseholdColumns({
      householdId,
      project,
      onSuccess,
    });

  // useEffect(() => {
  //   if (householdId) refetchHousehold();
  // }, [refetchHousehold, householdId]);

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
  const isMobile = useIsMobile();

  const columns = useMemo(() => {
    const defaults: ColumnDef<
      ClientSearchResultFieldsFragment | RecentHouseholdMember
    >[] = [
      { ...CLIENT_COLUMNS.name, sticky: 'left', width: '25%' }, // why does sticky make it so wide?
      CLIENT_COLUMNS.dobAge,
    ];
    if (isMobile) {
      // On mobile, show enrollment button right next to the client name so user
      // doesn't have to scroll to the right.
      defaults.splice(1, 0, ...addToEnrollmentColumns);
    } else {
      defaults.push(...addToEnrollmentColumns);
    }
    if (globalFeatureFlags?.mciId) {
      return [
        externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID'),
        ...defaults,
      ];
    }
    return defaults;
  }, [addToEnrollmentColumns, isMobile, globalFeatureFlags?.mciId]);

  const filters = useFilters({
    type: 'ClientFilterOptions',
  });

  const handleNewClientAdded = useCallback(
    (data: EnrollmentFieldsFragment) => {
      if (data.householdId !== householdId) {
        // onHouseholdIdChange(data.householdId);
        onSuccess(data.householdId);
      } else {
        refetchHousehold();
      }
    },
    [householdId, onSuccess, refetchHousehold]
  );

  const [searchInput, setSearchInput] = useState<ClientSearchInput>();
  const [hasSearched, setHasSearched] = useState(false);

  if (householdId && !household) return <Loading />;

  return (
    <Stack gap={4}>
      {/* FIXME: align on titlecard and commoncard */}
      <TitleCard
        title='Household'
        headerVariant={household ? 'border' : undefined}
      >
        {!household && loading && <Loading />}
        {!household && !loading && (
          <Paper
            sx={{
              py: 2,
              mx: 2,
              mb: 2,
              textAlign: 'center',
              color: 'text.secondary',
              backgroundColor: 'grayscale.tint',
              border: 'none',
            }}
          >
            No household members have been added to this enrollment
          </Paper>
        )}
        {household && (
          <EditHouseholdMemberTable
            household={household}
            currentDashboardEnrollmentId={currentDashboardEnrollmentId}
            refetchHousehold={refetchHousehold}
            loading={loading}
            project={project}
          />
        )}
      </TitleCard>
      {BackButton}
      {renderBackButton && renderBackButton(householdId)}
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

      <CommonCollapsibleCard title='Add Household Member'>
        <Stack gap={2} sx={{ py: 2 }}>
          <Grid container alignItems={'flex-start'} sx={{ px: 2 }}>
            <Grid item xs={12} md={9} lg={8}>
              <ClientTextSearchForm
                onSearch={(text) => setSearchInput({ textSearch: text })}
                searchAdornment
                label='Search for Client'
                minChars={3}
              />
            </Grid>
            <Grid item xs></Grid>
            <Grid item xs={12} md={3}>
              {hasSearched && (
                <RootPermissionsFilter permissions='canEditClients'>
                  <AddNewClientButton
                    projectId={project.id}
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
                ClientSearchResultFieldsFragment
              >
                queryVariables={{ input: searchInput }}
                queryDocument={SearchClientsDocument}
                columns={columns}
                pagePath='clientSearch'
                fetchPolicy='cache-and-network'
                filters={filters}
                recordType='Client'
                defaultSortOption={ClientSortOption.BestMatch}
                onCompleted={() => setHasSearched(true)}
                rowSecondaryActionConfigs={(row) => [
                  getViewClientMenuItem(row),
                ]}
                tableProps={{
                  'aria-label': 'Search results',
                }}
              />
            </SsnDobShowContextProvider>
          )}
        </Stack>
      </CommonCollapsibleCard>
    </Stack>
  );
};
export default ManageHousehold;
