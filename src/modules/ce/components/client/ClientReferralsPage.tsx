import React, { useMemo } from 'react';
import CommonTabs from '@/components/elements/CommonTabs';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import ClientOpportunitiesTable from '@/modules/ce/components/client/ClientOpportunitiesTable';
import ClientReferralsTable from '@/modules/ce/components/client/ClientReferralsTable';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import { useHasPermissions } from '@/modules/permissions/useHasPermissionsHooks';

const ClientReferralsPage: React.FC = () => {
  const { client } = useClientDashboardContext();
  const { globalFeatureFlags } = useGlobalFeatureFlags();

  const canViewClientEligibleOpportunities = useHasPermissions(client?.access, [
    'canViewClientEligibleOpportunities',
  ]);
  const canViewAnyReferrals = useHasPermissions(client?.access, [
    'canViewReferrals',
    'canViewOwnReferrals',
  ]);

  const tabDefinitions = useMemo(() => {
    const defs = [];

    if (canViewAnyReferrals) {
      defs.push({
        title: 'Referrals',
        key: 'referrals',
        contents: <ClientReferralsTable />,
      });
    }

    if (canViewClientEligibleOpportunities) {
      defs.push({
        title: 'Available Units',
        key: 'available-units',
        contents: <ClientOpportunitiesTable />,
      });
    }

    return defs;
  }, [canViewAnyReferrals, canViewClientEligibleOpportunities]);

  if (!globalFeatureFlags?.coordinatedEntryEnabled) return <NotFound />;

  if (!canViewClientEligibleOpportunities && !canViewAnyReferrals)
    return <NotFound />;

  return (
    <>
      <PageTitle title='Referrals' tabbedPage />
      <CommonTabs
        ariaLabel={'Client Referrals Tabs'}
        tabDefinitions={tabDefinitions}
      />
    </>
  );
};

export default ClientReferralsPage;
