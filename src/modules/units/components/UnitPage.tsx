import { Alert } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import CommonTabs from '@/components/elements/CommonTabs';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useCurrentPath from '@/hooks/useCurrentPath';
import useSafeParams from '@/hooks/useSafeParams';

import PrioritizedClientsTable from '@/modules/ce/components/unit/PrioritizedClientsTable';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import UnitOverview from '@/modules/units/components/UnitOverview';
import UnitReferralHistoryTable from '@/modules/units/components/UnitReferralHistoryTable';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { CeOpportunityStatus, useGetUnitQuery } from '@/types/gqlTypes';

interface Props {}
const UnitPage: React.FC<Props> = ({}) => {
  const { unitId } = useSafeParams() as {
    unitId: string;
    projectId: string;
  };
  const currentPath = useCurrentPath();

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
      [ProjectDashboardRoutes.CE_UNIT]: unit.name,
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
    const hasWaitlistWorkflow = !!unit.unitGroup?.workflowTemplateIdentifier;
    if (
      hasWaitlistWorkflow &&
      opportunity &&
      opportunity.status !== CeOpportunityStatus.Closed &&
      project.access.canViewPrioritizedClientLists
    ) {
      defs.push({
        title: 'Eligible Clients',
        key: 'clients',
        contents:
          !!unit.eligibilityRequirements &&
          unit.eligibilityRequirements.length > 0 &&
          !!unit.prioritySchemes ? (
            <PrioritizedClientsTable
              opportunity={opportunity}
              unitGroupId={unit.unitGroup?.id}
            />
          ) : (
            <Alert severity='warning'>
              This unit does not have any eligibility or prioritization rules
              specified.
            </Alert>
          ),
      });
    }

    if (project.access.canViewReferrals || project.access.canViewOwnReferrals) {
      defs.push({
        title: 'Referral History',
        key: 'referral-history',
        contents: (
          <UnitReferralHistoryTable
            projectId={project.id}
            unitId={unitId}
            unitName={unit.name}
            breadcrumbParentRoute={currentPath || ProjectDashboardRoutes.UNIT}
          />
        ),
      });
    }

    return defs;
  }, [currentPath, project, unit, unitId]);

  if (loading && !unit) return <Loading />;
  if (error) throw error;
  if (!unit) return <NotFound />;

  // This page is only available for projects that use waitlists.
  // Currently there is not really anything to show on a Unit page for projects that only do direct referrals.
  // (This condition should never be met because of the redirectRoute in the route definition; see protected.tsx)
  if (!project.coordinatedEntryFeatures?.supportsWaitlistReferrals)
    return <NotFound />;

  return (
    <>
      <PageTitle title={unit.name} />
      <CommonTabs
        ariaLabel={'Unit details tabs'}
        tabDefinitions={tabDefinitions}
      />
    </>
  );
};

export default UnitPage;
