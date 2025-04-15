import React from 'react';
import CommonTabs from '@/components/elements/CommonTabs';
import PageTitle from '@/components/layout/PageTitle';
import ClientOpportunitiesTable from '@/modules/ce/components/client/ClientOpportunitiesTable';
import ClientReferralsTable from '@/modules/ce/components/client/ClientReferralsTable';

const ClientReferralsPage: React.FC = () => {
  return (
    <>
      <PageTitle title={'Referrals'} />

      <CommonTabs
        ariaLabel={'Client Referrals Tabs'}
        tabDefinitions={[
          {
            title: 'All Referrals',
            key: 'referrals',
            contents: <ClientReferralsTable />,
          },
          {
            title: 'Eligible Opportunities',
            key: 'opportunities',
            contents: <ClientOpportunitiesTable />,
          },
        ]}
      />
    </>
  );
};

export default ClientReferralsPage;
