import React, { useMemo } from 'react';
import CommonTabs from '@/components/elements/CommonTabs';
import PageTitle from '@/components/layout/PageTitle';
import ProjectOpportunitiesTable from '@/modules/ce/components/project/ProjectOpportunitiesTable';
import ProjectReferralsTable from '@/modules/ce/components/project/ProjectReferralsTable';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

const ProjectCePage: React.FC = () => {
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
      <PageTitle title={'Coordinated Entry'} />
      <CommonTabs
        ariaLabel={'Project CE Tabs'}
        tabDefinitions={tabDefinitions}
      />
    </>
  );
};

export default ProjectCePage;
