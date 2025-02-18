import { Grid, Paper } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import useAddToHouseholdColumns from '../hooks/useAddToHouseholdColumns';
import { usePreviouslyAssociatedMembers } from '../hooks/usePreviouslyAssociatedMembers';

import EditHouseholdMemberTable from './EditHouseholdMemberTable';
import AddNewClientButton from './elements/AddNewClientButton';
import { ClickToCopyId } from '@/components/elements/ClickToCopy';
import { CommonCard2 } from '@/components/elements/CommonCard2';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import { getViewClientMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
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
  renderBackButton?: (householdId?: string) => ReactNode;
  onFirstMemberAdded?: (householdId: string) => void;
  canEdit: boolean;
}

const ManageHousehold = ({
  householdId,
  project,
  BackButton,
  renderBackButton,
  onFirstMemberAdded,
  canEdit,
}: Props) => {
  const { globalFeatureFlags } = useHmisAppSettings();

  const [searchInput, setSearchInput] = useState<ClientSearchInput>();
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
  const { addToEnrollmentColumns, refetchHousehold, household, loading } =
    useAddToHouseholdColumns({
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

  const columns = useMemo(() => {
    const defaults: ColumnDef<
      ClientSearchResultFieldsFragment | RecentHouseholdMember
    >[] = [
      { ...CLIENT_COLUMNS.name, sticky: 'left', width: '25%' }, // why does sticky make it so wide?
      CLIENT_COLUMNS.dobAge,
    ];

    // fixme get rid of this
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
      // fixme this should always call onsuccess, test it
      if (data.householdId !== householdId) {
        // onHouseholdIdChange(data.householdId);
        onSuccess(data.householdId);
      } else {
        refetchHousehold();
      }
    },
    [householdId, onSuccess, refetchHousehold]
  );

  return (
    <Stack gap={4}>
      {/* FIXME: align on titlecard and commoncard */}
      <CommonCard2
        title='Household'
        titleBorder
        TitleComponent='h1'
        padContent={false}
        actions={
          householdId && (
            <CommonLabeledTextBlock title='Household ID' horizontal>
              <ClickToCopyId value={householdId} />
            </CommonLabeledTextBlock>
          )
        }
      >
        {householdId && !household && loading && <Loading />}
        {!householdId && (
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
      </CommonCard2>
      {BackButton}

      {canEdit &&
        previouslyAssociatedMembers &&
        previouslyAssociatedMembers.length > 0 && (
          <>
            <CommonCard2
              title={`+ Add Previously Associated Household Members (${previouslyAssociatedMembers.length})`}
              collapsible
              padContent={false}
              open={previousMembersOpen}
              onClick={() => setPreviousMembersOpen(!previousMembersOpen)}
            >
              <Box sx={{ p: 2 }}>{previouslyAssociatedMembersDescription}</Box>
              <AssociatedHouseholdMembers
                recentMembers={previouslyAssociatedMembers}
                additionalColumns={addToEnrollmentColumns}
              />
            </CommonCard2>
          </>
        )}

      {canEdit && (
        <CommonCard2
          title='+ Add Household Member'
          collapsible
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
        </CommonCard2>
      )}
      {renderBackButton && renderBackButton(householdId)}
      <Box sx={{ height: 100 }} />
    </Stack>
  );
};
export default ManageHousehold;
