import React from 'react';
import CommonTabs from '@/components/elements/CommonTabs';
import PageTitle from '@/components/layout/PageTitle';
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
            title: 'Ongoing Referrals',
            key: 'referrals',
            contents: 'todo @martha',
          },
        ]}
      />
    </>
  );
};

export default AdminCoordinatedEntry;
