import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

const ReferralsPage: React.FC<Props> = ({ currentTab }) => {
  const [access] = useRootPermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    selector: workspaceSelector,
    hasWorkspaces,
    selectedProjectGroupId,
    loading: workspaceLoading,
    error: workspaceError,
  } = useWorkspaceSelector(WorkspaceAppliesTo.CeReferrals);

  const tabDefinitions = useMemo(() => {
    const tabs = [
      {
        title: 'Referrals',
        key: 'referrals',
        contents: <ReferralsTable projectGroupId={selectedProjectGroupId} />,
      },
    ];
    if (!!access?.canAdministrateCoordinatedEntry) {
      tabs.push(
        // Admins see additional tabs
        {
          title: 'Available Units',
          key: 'available-units',
          contents: (
            <AdminOpportunitiesTable projectGroupId={selectedProjectGroupId} />
          ),
        },
        {
          title: 'Eligible Clients',
          key: 'eligible-clients',
          contents: (
            <AdminCeClientsTable projectGroupId={selectedProjectGroupId} />
          ),
        }
      );
    }
    return tabs;
  }, [access?.canAdministrateCoordinatedEntry, selectedProjectGroupId]);

  const handleChangeTab = (key: string) => {
    const workspace = new URLSearchParams(location.search).get('workspace');
    const search = workspace
      ? `?workspace=${encodeURIComponent(workspace)}`
      : '';
    switch (key) {
      case 'referrals':
        navigate(`${Routes.REFERRALS}${search}`);
        break;
      case 'available-units':
        navigate(`${ReferralRoutes.AVAILABLE_UNITS}${search}`);
        break;
      case 'eligible-clients':
        navigate(`${ReferralRoutes.ELIGIBLE_CLIENTS}${search}`);
        break;
    }
  };

  if (workspaceError) throw workspaceError;

  return (
    <PageContainer
      title='Referrals'
      actions={hasWorkspaces ? workspaceSelector : undefined}
    >
      {workspaceLoading ? (
        <Loading />
      ) : (
        <CommonTabs
          tabDefinitions={tabDefinitions}
          ariaLabel='Referrals'
          collapseSingleTab //non-admins only see Referrals, with no tabs
          currentTab={currentTab}
          onChangeTab={handleChangeTab}
        />
      )}
    </PageContainer>
  );
};

export default ReferralsPage;
