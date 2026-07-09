import { Alert } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import CommonTabs from '@/components/elements/CommonTabs';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';

import PrioritizedClientsTable from '@/modules/ce/components/unit/PrioritizedClientsTable';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import UnitOverview from '@/modules/units/components/UnitOverview';
import UnitReferralHistoryTable from '@/modules/units/components/UnitReferralHistoryTable';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { CeOpportunityStatus, useGetUnitQuery } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
          <UnitReferralHistoryTable projectId={project.id} unitId={unitId} />
        ),
      });
    }

    return defs;
  }, [project, unit, unitId]);

  if (loading && !unit) return <Loading />;
  if (error) throw error;
  if (!unit) return <NotFound />;

  // This page is only available for projects that use waitlists.
  // Currently there is not really anything to show on a Unit page for projects that only do direct referrals.
  // (This condition should never be met because of the redirectRoute in the route definition; see protected.tsx)
  if (!project.coordinatedEntryFeatures?.supportsWaitlistReferrals)
    return <NotFound />;

  // If the unit group doesn't have a workflow template identifier, creating client-list-based referrals will not work.
  // Redirect to the project units page. (redirectRoute in the route definition doesn't handle this)
  if (!unit.unitGroup?.workflowTemplateIdentifier) {
    return (
      <Navigate
        to={generateSafePath(ProjectDashboardRoutes.UNITS, {
          projectId: project.id,
        })}
        replace
      />
    );
  }

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
