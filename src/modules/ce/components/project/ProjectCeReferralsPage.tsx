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

    // TODO(#7321): only render referrals tab on this page if this project has CE referral feature enabled (either directly or via waitlist)
    if (project.access.canViewReferrals || project.access.canViewOwnReferrals) {
      defs.push({
        title: 'Referrals',
        key: 'referrals',
        contents: <ProjectReferralsTable projectId={project.id} />,
      });
    }

    // TODO(#7321): only render units tab on this page if this project uses waitlist-based referral creation. It doesn't make sense to link to unit from here if it doesn't have waitlist.
    if (project.access.canViewUnits) {
      defs.push({
        title: 'Available Units',
        key: 'available-units',
        contents: <ProjectOpportunitiesTable projectId={project.id} />,
      });
    }

    // TODO(#7321) if project can send direct referrals (or has any sent referrals?), display table of outgoing referrals
    // {
    //   title: 'Sent Referrals',
    //   key: 'sent-referrals',
    //   contents: null, // Placeholder for future implementation
    // }

    return defs;
  }, [project]);

  // TODO(#7321) if project can send direct referrals, add button linking to a Send Referral page (similar to NewOutgoingReferralPage)
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
