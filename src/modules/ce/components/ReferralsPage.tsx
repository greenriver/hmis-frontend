import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import CommonTabs from '@/components/elements/CommonTabs';
import Loading from '@/components/elements/Loading';
import PageContainer from '@/components/layout/PageContainer';
import useWorkspaceSelector from '@/hooks/useWorkspaceSelector';
import AdminCeClientsTable from '@/modules/ce/components/admin/AdminCeClientsTable';
import AdminOpportunitiesTable from '@/modules/ce/components/admin/AdminOpportunitiesTable';
import ReferralsTable from '@/modules/ce/components/ReferralsTable';

import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { ReferralRoutes, Routes } from '@/routes/routes';
import { WorkspaceAppliesTo } from '@/types/gqlTypes';

export type CeTabKey = 'referrals' | 'available-units' | 'eligible-clients';

interface Props {
  currentTab: CeTabKey;
}

const TAB_ROUTES: Record<CeTabKey, string> = {
  referrals: Routes.REFERRALS,
  'available-units': ReferralRoutes.AVAILABLE_UNITS,
  'eligible-clients': ReferralRoutes.ELIGIBLE_CLIENTS,
};

const ReferralsPage: React.FC<Props> = ({ currentTab }) => {
  const [access] = useRootPermissions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load workspace selector (if configured) for selecting project group
  const {
    selector: workspaceSelector,
    selectedProjectGroupId,
    loading: workspaceLoading,
    error: workspaceError,
  } = useWorkspaceSelector(WorkspaceAppliesTo.CeReferrals);

  // Only CE Admins can see the Units and Eligible Clients tabs
  const showUnits = useMemo(() => !!access?.canIndexOpportunities, [access]);
  const showEligibleClients = useMemo(
    () => !!access?.canIndexEligibleClients,
    [access]
  );
  const showUnitsAndEligibleClients = showUnits && showEligibleClients;

  const tabDefinitions = useMemo(() => {
    const tabs = [
      {
        title: 'Referrals',
        key: 'referrals',
        contents: (
          <ReferralsTable
            projectGroupId={selectedProjectGroupId}
            searchSize={
              // Show small search input for admins who see multiple tabs
              showUnitsAndEligibleClients ? 'small' : 'medium'
            }
          />
        ),
      },
    ];
    if (showUnits) {
      tabs.push({
        title: 'Available Units',
        key: 'available-units',
        contents: (
          <AdminOpportunitiesTable projectGroupId={selectedProjectGroupId} />
        ),
      });
    }
    if (showEligibleClients) {
      tabs.push({
        title: 'Eligible Clients',
        key: 'eligible-clients',
        contents: (
          <AdminCeClientsTable projectGroupId={selectedProjectGroupId} />
        ),
      });
    }
    return tabs;
  }, [
    selectedProjectGroupId,
    showUnitsAndEligibleClients,
    showUnits,
    showEligibleClients,
  ]);

  const handleChangeTab = (key: string) => {
    const pathname = TAB_ROUTES[key as CeTabKey];
    if (!pathname) return;

    const workspaceParam = searchParams.get('workspace');
    const search = workspaceParam
      ? new URLSearchParams({ workspace: workspaceParam }).toString()
      : '';

    navigate({ pathname, search });
  };

  if (workspaceError) throw workspaceError;
  if (workspaceLoading) return <Loading />;

  return (
    <PageContainer title='Referrals' actions={workspaceSelector}>
      <CommonTabs
        tabDefinitions={tabDefinitions}
        ariaLabel='Referrals'
        collapseSingleTab
        currentTab={currentTab}
        onChangeTab={handleChangeTab}
      />
    </PageContainer>
  );
};

export default ReferralsPage;
