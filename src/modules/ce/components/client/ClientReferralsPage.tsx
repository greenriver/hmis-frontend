import React, { useMemo } from 'react';
import CommonTabs from '@/components/elements/CommonTabs';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import ClientOpportunitiesTable from '@/modules/ce/components/client/ClientOpportunitiesTable';
import ClientReferralsTable from '@/modules/ce/components/client/ClientReferralsTable';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';

const ClientReferralsPage: React.FC = () => {
  const [canViewClientEligibleOpportunities] = useHasRootPermissions([
    'canViewClientEligibleOpportunities',
  ]);
  const [canViewAnyReferrals] = useHasRootPermissions([
    'canViewReferrals',
    'canViewOwnReferrals',
  ]);

  const tabDefinitions = useMemo(() => {
    const defs = [];

    if (canViewAnyReferrals) {
      defs.push({
        title: 'All Referrals',
        key: 'referrals',
        contents: <ClientReferralsTable />,
      });
    }

    if (canViewClientEligibleOpportunities) {
      defs.push({
        title: 'Eligible Opportunities',
        key: 'opportunities',
        contents: <ClientOpportunitiesTable />,
      });
    }

    return defs;
  }, [canViewAnyReferrals, canViewClientEligibleOpportunities]);

  if (!canViewClientEligibleOpportunities && !canViewAnyReferrals)
    return <NotFound />;

  return (
    <>
      <PageTitle title={'Referrals'} />
      <CommonTabs
        ariaLabel={'Client Referrals Tabs'}
        tabDefinitions={tabDefinitions}
      />
    </>
  );
};

export default ClientReferralsPage;
