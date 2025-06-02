import React, { useMemo } from 'react';
import CommonTabs from '@/components/elements/CommonTabs';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import CreateOpportunityButton from '@/modules/ce/components/CreateOpportunityButton';
import ProjectOpportunitiesTable from '@/modules/ce/components/project/ProjectOpportunitiesTable';
import ProjectReferralsTable from '@/modules/ce/components/project/ProjectReferralsTable';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

const ProjectCePage: React.FC = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  const { project } = useProjectDashboardContext();

  const tabDefinitions = useMemo(() => {
    const defs = [];

    if (project.access.canViewReferrals || project.access.canViewOwnReferrals) {
      defs.push({
        title: 'Ongoing Referrals',
        key: 'referrals',
        contents: <ProjectReferralsTable />,
      });
    }

    if (project.access.canViewUnits) {
      defs.push({
        title: 'Available Units',
        key: 'available-units',
        // TODO add helper: these units are available for referrals
        contents: <ProjectOpportunitiesTable />,
      });
    }
    return defs;
  }, [
    project.access.canViewOwnReferrals,
    project.access.canViewReferrals,
    project.access.canViewUnits,
  ]);

  return (
    <>
      <PageTitle
        title={'Coordinated Entry'}
        actions={<CreateOpportunityButton projectId={projectId} />}
      />
      <CommonTabs
        ariaLabel={'Project CE Tabs'}
        tabDefinitions={tabDefinitions}
      />
    </>
  );
};

export default ProjectCePage;
