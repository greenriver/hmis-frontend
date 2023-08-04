import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Box, Button } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useEffect, useState } from 'react';

import useAddToHouseholdColumns from '../hooks/useAddToHouseholdColumns';
import { useRecentHouseholdMembers } from '../hooks/useRecentHouseholdMembers';

import EditHouseholdMemberTable from './EditHouseholdMemberTable';
import { CommonCard } from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import { useNewClientEnrollmentFormDialog } from '@/modules/enrollment/hooks/useNewClientEnrollmentFormDialog';
import AssociatedHouseholdMembers, {
  householdMemberColumns,
} from '@/modules/household/components/AssociatedHouseholdMembers';
import { RecentHouseholdMember } from '@/modules/household/types';
import AddClientPrompt from '@/modules/search/components/AddClientPrompt';
import ClientSearch from '@/modules/search/components/ClientSearch';
import {
  ClientFieldsFragment,
  EnrollmentFieldsFragment,
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
  // This may or may not be in a Client Dashboard. If it is, we need to treat the dashboard client differently.
  const { client } = useClientDashboardContext();
  const currentDashboardClientId = client?.id;

  const {
    addToEnrollmentColumns,
    refetchHousehold,
    household,
    onHouseholdIdChange,
    loading,
    // refetchLoading,
    // householdLoading,
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

  const columns: ColumnDef<ClientFieldsFragment | RecentHouseholdMember>[] = [
    ...householdMemberColumns,
    ...addToEnrollmentColumns,
  ];

  const {
    openNewClientEnrollmentFormDialog,
    renderNewClientEnrollmentFormDialog,
  } = useNewClientEnrollmentFormDialog({
    projectId,
    householdId: household?.id,
    onCompleted: (data: EnrollmentFieldsFragment) => {
      if (data.householdId !== household?.id) {
        onHouseholdIdChange(data.householdId);
      } else {
        refetchHousehold();
      }
    },
  });

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
            currentDashboardClientId={currentDashboardClientId}
            refetchHousehold={refetchHousehold}
            loading={loading}
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
        <ClientSearch
          hideInstructions
          hideProject
          hideAdvanced
          cardsEnabled={false}
          pageSize={10}
          wrapperComponent={Box}
          searchResultsTableProps={{
            rowLinkTo: undefined,
            tableProps: { size: 'small' },
            columns,
          }}
          hideAddClient
          renderActions={(searchPerformed) => {
            if (!searchPerformed) return null;
            return (
              <AddClientPrompt>
                <Button
                  onClick={openNewClientEnrollmentFormDialog}
                  data-testid='addClientButton'
                  sx={{ px: 3 }}
                  startIcon={<PersonAddIcon />}
                  variant='outlined'
                >
                  Add Client
                </Button>
              </AddClientPrompt>
            );
          }}
        />
      </CommonCard>
      {renderNewClientEnrollmentFormDialog()}
    </Stack>
  );
};
export default ManageHousehold;
