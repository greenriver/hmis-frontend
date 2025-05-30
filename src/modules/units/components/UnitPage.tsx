import React, { useEffect } from 'react';
import Loading from '@/components/elements/Loading';
import useSafeParams from '@/hooks/useSafeParams';
import Opportunity from '@/modules/ce/components/Opportunity';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { useGetUnitQuery } from '@/types/gqlTypes';

interface Props {}
const UnitPage: React.FC<Props> = ({}) => {
  const { unitId, projectId } = useSafeParams() as {
    unitId: string;
    projectId: string;
  };

  const { overrideBreadcrumbTitles } = useProjectDashboardContext();

  const {
    data: { unit } = {},
    loading,
    error,
  } = useGetUnitQuery({
    variables: {
      id: unitId,
      includeCeFields: true, // currently we only render this page if CE is enabled
    },
  });

  // Set the breadcrumb so it says the correct name of this unit and group
  useEffect(() => {
    if (!unit) return;

    overrideBreadcrumbTitles({
      [ProjectDashboardRoutes.UNIT]: unit.name,
      // fixme unable to inject unit group name
      [ProjectDashboardRoutes.UNIT_GROUP]: unit.unitGroup?.name || 'Unit Group',
    });
  }, [overrideBreadcrumbTitles, unit]);

  if (loading) return <Loading />;
  if (error) throw error;

  if (unit?.latestOpportunity) {
    return (
      <Opportunity
        projectId={projectId}
        opportunity={unit?.latestOpportunity}
      />
    );
  }

  return <div>Unit Page </div>;
};

export default UnitPage;
