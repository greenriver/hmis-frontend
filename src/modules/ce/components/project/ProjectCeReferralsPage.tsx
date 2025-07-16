import React, { useMemo } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonTabs from '@/components/elements/CommonTabs';
import PageTitle from '@/components/layout/PageTitle';
import ProjectOpportunitiesTable from '@/modules/ce/components/project/ProjectOpportunitiesTable';
import ProjectReferralsTable from '@/modules/ce/components/project/ProjectReferralsTable';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

const ProjectCeReferralsPage: React.FC = () => {
  const { project } = useProjectDashboardContext();

  const projectSendsDirectReferrals =
    project.coordinatedEntryFeatures?.sendsDirectReferrals;
  const userCanSendReferrals = project.access.canManageOutgoingReferrals;

  const tabDefinitions = useMemo(() => {
    const defs = [];

    const projectSupportsReferrals =
      project.coordinatedEntryFeatures?.supportsReferrals;
    const userCanViewReferrals =
      project.access.canViewReferrals || project.access.canViewOwnReferrals;
    if (projectSupportsReferrals && userCanViewReferrals) {
      defs.push({
        title: 'Referrals',
        key: 'referrals',
        contents: <ProjectReferralsTable projectId={project.id} />,
      });
    }

    // Only render units tab on this page if this project uses waitlist-based referral creation.
    // It doesn't make sense to link to unit from here if it doesn't have waitlist.
    const projectSupportsWaitlistReferrals =
      project.coordinatedEntryFeatures?.supportsWaitlistReferrals;
    const userCanViewUnits = project.access.canViewUnits;
    if (projectSupportsWaitlistReferrals && userCanViewUnits) {
      defs.push({
        title: 'Available Units',
        key: 'available-units',
        contents: <ProjectOpportunitiesTable projectId={project.id} />,
      });
    }

    if (projectSendsDirectReferrals && userCanSendReferrals) {
      defs.push({
        title: 'Sent Referrals',
        key: 'sent-referrals',
        contents: 'Placeholder', // Placeholder for future implementation
      });
    }
    return defs;
  }, [project, projectSendsDirectReferrals, userCanSendReferrals]);

  const actions = useMemo(() => {
    if (userCanSendReferrals && projectSendsDirectReferrals) {
      return (
        <ButtonLink
          variant='contained'
          to={generateSafePath(ProjectDashboardRoutes.SEND_REFERRAL, {
            projectId: project.id,
          })}
        >
          Send Referral
        </ButtonLink>
      );
    }
  }, [project.id, projectSendsDirectReferrals, userCanSendReferrals]);

  return (
    <>
      <PageTitle title='Referrals' actions={actions} />
      <CommonTabs
        ariaLabel={'Project CE Tabs'}
        tabDefinitions={tabDefinitions}
      />
    </>
  );
};

export default ProjectCeReferralsPage;
