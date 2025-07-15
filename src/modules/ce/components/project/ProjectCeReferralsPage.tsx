import React, { useMemo } from 'react';
import CommonTabs from '@/components/elements/CommonTabs';
import PageTitle from '@/components/layout/PageTitle';
import ProjectOpportunitiesTable from '@/modules/ce/components/project/ProjectOpportunitiesTable';
import ProjectReferralsTable from '@/modules/ce/components/project/ProjectReferralsTable';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

const ProjectCeReferralsPage: React.FC = () => {
  const { project } = useProjectDashboardContext();

  const tabDefinitions = useMemo(() => {
    const defs = [];

    if (project.access.canViewReferrals || project.access.canViewOwnReferrals) {
      defs.push({
        title: 'Referrals',
        key: 'referrals',
        contents: <ProjectReferralsTable projectId={project.id} />,
      });
    }

    if (project.access.canViewUnits) {
      defs.push({
        title: 'Available Units',
        key: 'available-units',
        contents: <ProjectOpportunitiesTable projectId={project.id} />,
      });
    }
    return defs;
  }, [project]);

  return (
    <>
      <PageTitle title='Referrals' tabbedPage />
      <CommonTabs
        ariaLabel={'Project CE Tabs'}
        tabDefinitions={tabDefinitions}
      />
    </>
  );
};

export default ProjectCeReferralsPage;
