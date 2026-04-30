import React, { useMemo } from 'react';

import CommonTabs from '@/components/elements/CommonTabs';
import PageContainer from '@/components/layout/PageContainer';
import AdminCeClientsTable from '@/modules/ce/components/admin/AdminCeClientsTable';
import AdminOpportunitiesTable from '@/modules/ce/components/admin/AdminOpportunitiesTable';
import ReferralsTable from '@/modules/ce/components/ReferralsTable';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';

const ReferralsPage: React.FC = () => {
  const [access] = useRootPermissions();

  const tabDefinitions = useMemo(() => {
    const tabs = [
      {
        title: 'Referrals',
        key: 'referrals',
        contents: <ReferralsTable />,
      },
    ];
    if (!!access?.canAdministrateCoordinatedEntry) {
      tabs.push(
        // Admins see additional tabs
        {
          title: 'Available Units',
          key: 'units',
          contents: <AdminOpportunitiesTable />,
        },
        {
          title: 'Eligible Clients',
          key: 'clients',
          contents: <AdminCeClientsTable />,
        }
      );
    }
    return tabs;
  }, [access?.canAdministrateCoordinatedEntry]);

  return (
    <PageContainer title='Referrals' overlineText='Coordinated Entry'>
      {/* non-admins see only Referrals and no tabs thanks to collapseSingleTab (true by default) */}
      <CommonTabs tabDefinitions={tabDefinitions} ariaLabel='Referrals' />
    </PageContainer>
  );
};

export default ReferralsPage;
