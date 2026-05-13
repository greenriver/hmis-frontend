import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import CommonTabs from '@/components/elements/CommonTabs';
import PageContainer from '@/components/layout/PageContainer';
import AdminCeClientsTable from '@/modules/ce/components/admin/AdminCeClientsTable';
import AdminOpportunitiesTable from '@/modules/ce/components/admin/AdminOpportunitiesTable';
import ReferralsTable from '@/modules/ce/components/ReferralsTable';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { Routes, ReferralRoutes } from '@/routes/routes';

export type CeTabKey = 'referrals' | 'available-units' | 'eligible-clients';

interface Props {
  currentTab: CeTabKey;
}

const ReferralsPage: React.FC<Props> = ({ currentTab }) => {
  const [access] = useRootPermissions();
  const navigate = useNavigate();

  const tabDefinitions = useMemo(() => {
    const tabs = [
      {
        title: 'Referrals',
        key: 'referrals',
        contents: (
          <ReferralsTable
            searchSize={
              // Show small search input for admins who see multiple tabs
              access?.canAdministrateCoordinatedEntry ? 'small' : 'medium'
            }
          />
        ),
      },
    ];
    if (!!access?.canAdministrateCoordinatedEntry) {
      tabs.push(
        // Admins see additional tabs
        {
          title: 'Available Units',
          key: 'available-units',
          contents: <AdminOpportunitiesTable />,
        },
        {
          title: 'Eligible Clients',
          key: 'eligible-clients',
          contents: <AdminCeClientsTable />,
        }
      );
    }
    return tabs;
  }, [access?.canAdministrateCoordinatedEntry]);

  const handleChangeTab = (key: string) => {
    switch (key) {
      case 'referrals':
        navigate(Routes.REFERRALS);
        break;
      case 'available-units':
        navigate(ReferralRoutes.AVAILABLE_UNITS);
        break;
      case 'eligible-clients':
        navigate(ReferralRoutes.ELIGIBLE_CLIENTS);
        break;
    }
  };

  return (
    <PageContainer title='Referrals'>
      {/* non-admins see only Referrals, thanks to collapseSingleTab */}
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
