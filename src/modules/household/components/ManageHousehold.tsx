import { Grid, Paper } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import useAddToHouseholdColumns from '../hooks/useAddToHouseholdColumns';
import { usePreviouslyAssociatedMembers } from '../hooks/usePreviouslyAssociatedMembers';

import AddNewClientButton from './elements/AddNewClientButton';
import HouseholdMemberTable from './HouseholdMemberTable';
import { ClickToCopyId } from '@/components/elements/ClickToCopy';
import CommonCard from '@/components/elements/CommonCard';
import CommonCollapsibleCard from '@/components/elements/CommonCollapsibleCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import { getViewClientMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import NotFound from '@/components/pages/NotFound';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import { useIsMobile } from '@/hooks/useIsMobile';
import useTableFilters from '@/hooks/useTableFilters';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssociatedHouseholdMembers from '@/modules/household/components/AssociatedHouseholdMembers';
import HouseholdActionButtons from '@/modules/household/components/elements/HouseholdActionButtons';
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
  onFirstMemberAdded?: (householdId: string) => void;
  canEdit: boolean;
}

const ManageHousehold = ({
  householdId,
  project,
  BackButton,
  onFirstMemberAdded,
  canEdit,
}: Props) => {
  const { globalFeatureFlags } = useGlobalFeatureFlags();

  const [searchInput, setSearchInput] = useState<ClientSearchInput>();
  // Whether the user has searched for clients (and the results are visible).
  // Visibility of "Add New Client" button is gated on this, to prevent user from adding
  // duplicate clients before completing a search.
  const [hasSearched, setHasSearched] = useState(false);
  // Search is expanded by default only if this is a new household (no members yet)
  const [searchOpen, setSearchOpen] = useState(!householdId);
  const [previousMembersOpen, setPreviousMembersOpen] = useState(false);

  const onSuccess = useCallback(
    (newHouseholdId: string) => {
      if (!householdId && onFirstMemberAdded) {
        onFirstMemberAdded(newHouseholdId);
      }
      setSearchOpen(false);
      setSearchInput(undefined);
      setPreviousMembersOpen(false);
    },
    [householdId, onFirstMemberAdded]
  );
  const {
    addToEnrollmentColumns,
    refetchHousehold,
    household,
    householdNotFound,
    loading,
  } = useAddToHouseholdColumns({
    householdId,
    project,
    onSuccess,
  });

  // Fetch members to show in "previously associated" table
  const {
    previouslyAssociatedMembers,
    previouslyAssociatedMembersDescription,
  } = usePreviouslyAssociatedMembers(household);

  const isMobile = useIsMobile();

  const searchResultColumns: ColumnDef<
    ClientSearchResultFieldsFragment | RecentHouseholdMember
  >[] = useMemo(() => {
    return [
      { ...CLIENT_COLUMNS.name, key: 'name', sticky: 'left', width: '25%' },
      ...(globalFeatureFlags?.mciIdEnabled
        ? [externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID')]
        : []),
      // On mobile, show enrollment button right next to the client name so user.
      // This needs fixing, ideally we could use a sticky column but it doesn't work as expected on mobile
      ...(isMobile ? addToEnrollmentColumns : []),
      CLIENT_COLUMNS.dobAge,
      ...(isMobile ? [] : addToEnrollmentColumns),
    ];
  }, [addToEnrollmentColumns, globalFeatureFlags, isMobile]);

  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'ClientFilterOptions',
  });

  const handleNewClientAdded = useCallback(
    (data: EnrollmentFieldsFragment) => {
      onSuccess(data.householdId);
      refetchHousehold();
    },
    [onSuccess, refetchHousehold]
  );

  if (householdId && !household && loading && <Loading />) return <Loading />;
  // could happen if user entered bad URL for /projects/:id/add-household/:householdId
  if (householdNotFound) return <NotFound />;

  return (
    <Stack gap={4}>
      <CommonCard
        title='Household'
        headerVariant={householdId ? 'border' : undefined}
        TitleComponent='h1'
        padContent={false}
        actions={
          householdId &&
          !isMobile && (
            <CommonLabeledTextBlock title='Household ID' horizontal>
              <ClickToCopyId
                value={householdId}
                ariaLabel='Copy Household ID'
              />
            </CommonLabeledTextBlock>
          )
        }
      >
        {!householdId && (
          <Paper
            sx={{
              py: 2,
              mx: 2,
              mb: 2,
              textAlign: 'center',
              color: 'text.secondary',
              backgroundColor: 'grayscale.surface',
              border: 'none',
            }}
          >
            No household members have been added to this enrollment
          </Paper>
        )}
        {household && (
          <HouseholdMemberTable
            household={household}
            refetchHousehold={refetchHousehold}
            loading={loading}
            project={project}
            canEdit={canEdit}
          />
        )}
        {canEdit && household && (
          <Box sx={{ p: 3 }}>
            <HouseholdActionButtons
              householdMembers={household.householdClients}
            />
          </Box>
        )}
      </CommonCard>
      {BackButton}
      {canEdit &&
        previouslyAssociatedMembers &&
        previouslyAssociatedMembers.length > 0 && (
          <>
            <CommonCollapsibleCard
              title={`+ Add Previously Associated Household Members (${previouslyAssociatedMembers.length})`}
              padContent={false}
              open={previousMembersOpen}
              onClick={() => setPreviousMembersOpen(!previousMembersOpen)}
            >
              <Box sx={{ p: 2 }}>{previouslyAssociatedMembersDescription}</Box>
              <AssociatedHouseholdMembers
                recentMembers={previouslyAssociatedMembers}
                additionalColumns={addToEnrollmentColumns}
              />
            </CommonCollapsibleCard>
          </>
        )}

      {canEdit && (
        <CommonCollapsibleCard
          title='+ Add Household Member'
          padContent={false}
          open={searchOpen}
          onClick={() => setSearchOpen(!searchOpen)}
          // Clear search results when card collapses
          onExited={() => setSearchInput(undefined)}
        >
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
                  <RootPermissionsFilter permissions='canCreateClients'>
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
                  columns={searchResultColumns}
                  pagePath='clientSearch'
                  fetchPolicy='cache-and-network'
                  filters={filters}
                  filterValues={filterValues}
                  onFilterChange={setFilterValues}
                  recordType='Client'
                  defaultSortOption={ClientSortOption.BestMatch}
                  onDataReady={() => setHasSearched(true)}
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
      )}
      <Box sx={{ height: 100 }} />
    </Stack>
  );
};
export default ManageHousehold;
