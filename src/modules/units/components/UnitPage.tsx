import React, { useEffect, useMemo } from 'react';
import CommonTabs from '@/components/elements/CommonTabs';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';

import PrioritizedClientsTable from '@/modules/ce/components/unit/PrioritizedClientsTable';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import UnitOverview from '@/modules/units/components/UnitOverview';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { CeOpportunityStatus, useGetUnitQuery } from '@/types/gqlTypes';

interface Props {}
const UnitPage: React.FC<Props> = ({}) => {
  const { unitId } = useSafeParams() as {
    unitId: string;
    projectId: string;
  };

  const { project, overrideBreadcrumbTitles } = useProjectDashboardContext();

  const {
    data: { unit } = {},
    loading,
    error,
  } = useGetUnitQuery({
    variables: {
      id: unitId,
      includeCeFields: true, // we only render this page if the project supports CE referrals
    },
  });

  // Set the breadcrumb so it says the correct name of this unit and group
  useEffect(() => {
    if (!unit) return;

    overrideBreadcrumbTitles({
      [ProjectDashboardRoutes.UNIT]: unit.name,
      [ProjectDashboardRoutes.UNIT_GROUP]: unit.unitGroup?.name || 'Unit Group',
    });
  }, [overrideBreadcrumbTitles, unit]);

  const tabDefinitions = useMemo(() => {
    if (!unit) return [];
    const defs = [];

    defs.push({
      title: 'Overview',
      key: 'overview',
      contents: <UnitOverview unit={unit} />,
    });

    const opportunity = unit.latestOpportunity;
    if (
      opportunity &&
      opportunity.status !== CeOpportunityStatus.Closed &&
      project.access.canViewPrioritizedClientLists
    ) {
      defs.push({
        title: 'Eligible Clients',
        key: 'clients',
        contents: (
          <PrioritizedClientsTable
            opportunity={opportunity}
            unitGroupId={unit.unitGroup?.id}
          />
        ),
      });
    }

    // TODO(#7430) - add a tab that displays referral history for this opportunity
    // if (opportunity && project.access.canViewPrioritizedClientLists) {
    //   defs.push({
    //     title: 'Closed Referrals',
    //     key: 'closed-referrals',
    //     contents: <Paper>Referral History for this Opportunity</Paper>,
    //   });
    // }

    return defs;
  }, [project, unit]);

  if (loading) return <Loading />;
  if (error) throw error;
  if (!unit) return <NotFound />;

  return (
    <>
      <PageTitle title={unit.name} />
      <CommonTabs
        ariaLabel={'Eligible Clients and Details tabs'}
        tabDefinitions={tabDefinitions}
      />
    </>
  );
};

export default UnitPage;
