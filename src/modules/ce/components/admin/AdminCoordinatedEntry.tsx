import React from 'react';
import AdminReferralsTable from './AdminReferralsTable';
import CommonTabs from '@/components/elements/CommonTabs';
import PageTitle from '@/components/layout/PageTitle';
import AdminCeClientsTable from '@/modules/ce/components/admin/AdminCeClientsTable';
import AdminOpportunitiesTable from '@/modules/ce/components/admin/AdminOpportunitiesTable';

const AdminCoordinatedEntry: React.FC = () => {
  return (
    <>
      <PageTitle title='Coordinated Entry' overlineText='Admin' />
      <CommonTabs
        ariaLabel={'Admin CE Tabs'}
        tabDefinitions={[
          {
            title: 'Available Units',
            key: 'opportunities',
            contents: <AdminOpportunitiesTable />,
          },
          {
            title: 'Referrals',
            key: 'referrals',
            contents: <AdminReferralsTable />,
          },
          {
            title: 'Eligible Clients',
            key: 'eligible_clients',
            contents: <AdminCeClientsTable />,
          },
        ]}
      />
    </>
  );
};

export default AdminCoordinatedEntry;
