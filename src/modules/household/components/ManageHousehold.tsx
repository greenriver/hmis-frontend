import { Box } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useEffect, useState } from 'react';

import useAddToHouseholdColumns from '../hooks/useAddToHouseholdColumns';

import EditHouseholdMemberTable from './EditHouseholdMemberTable';
import { useRecentHouseholdMembers } from './useRecentHouseholdMembers';

import { CommonCard } from '@/components/elements/CommonCard';
import Loading from '@/components/elements/Loading';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import AssociatedHouseholdMembers, {
  householdMemberColumns,
} from '@/modules/household/components/AssociatedHouseholdMembers';
import { RecentHouseholdMember } from '@/modules/household/types';
import ClientSearch from '@/modules/search/components/ClientSearch';
import { ClientFieldsFragment } from '@/types/gqlTypes';

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
    refetchLoading,
    householdLoading,
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
    if (refetchLoading || !recentMembers) return;

    const hc = household?.householdClients || [];
    const currentMembersMap = new Set(hc.map((c) => c.client.id));

    setRecentEligibleMembers(
      recentMembers.filter(({ client }) => !currentMembersMap.has(client.id))
    );
  }, [currentDashboardClientId, recentMembers, household, refetchLoading]);

  useScrollToHash(householdLoading || recentMembersLoading);

  const columns: ColumnDef<ClientFieldsFragment | RecentHouseholdMember>[] = [
    ...householdMemberColumns,
    ...addToEnrollmentColumns,
  ];

  if (initialHouseholdId && !household && householdLoading) {
    return <Loading />;
  }
  return (
    <Stack gap={4}>
      {!household && (
        <CommonCard
          sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}
        >
          No Members, Search to Add Clients
        </CommonCard>
      )}
      {household && (
        <TitleCard title='Current Household' headerVariant='border'>
          <EditHouseholdMemberTable
            household={household}
            currentDashboardClientId={currentDashboardClientId}
            refetchHousehold={refetchHousehold}
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
          addClientInDialog
          searchResultsTableProps={{
            rowLinkTo: undefined,
            tableProps: { size: 'small' },
            columns,
          }}
        />
      </CommonCard>
    </Stack>
  );
};
export default ManageHousehold;
