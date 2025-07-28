import React, { useMemo } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonTabs from '@/components/elements/CommonTabs';
import { SendIcon } from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
import ProjectOutgoingReferralsTable from '@/modules/ce/components/directReferral/ProjectOutgoingReferralsTable';
import ProjectOpportunitiesTable from '@/modules/ce/components/project/ProjectOpportunitiesTable';
import ProjectReferralsTable from '@/modules/ce/components/project/ProjectReferralsTable';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

const ProjectCeReferralsPage: React.FC = () => {
  const { project } = useProjectDashboardContext();

  // CE Referral features this project supports
  const { sendsDirectReferrals, supportsReferrals, supportsWaitlistReferrals } =
    project.coordinatedEntryFeatures || {};

  // User permissions related to CE Referrals
  const {
    canManageOutgoingReferrals,
    canViewReferrals,
    canViewOwnReferrals,
    canViewUnits,
  } = project.access;

  // If the project supports referrals AND the user can view referrals, show the Referrals tab
  const showReferralsTab =
    supportsReferrals && (canViewReferrals || canViewOwnReferrals);

  // If the project supports *waitlist* referrals AND the user can view units, show the Units tab.
  // Only waitlist (not direct) referrals because it doesn't make sense to link to a unit from here if it doesn't have waitlist.
  const showAvailableUnitsTab = supportsWaitlistReferrals && canViewUnits;

  // If the project can send direct referrals AND the user has permission to manage outgoing referrals, show the Outgoing Referrals tab
  const showOutgoingReferrals =
    sendsDirectReferrals && canManageOutgoingReferrals;

  const tabDefinitions = useMemo(() => {
    const defs = [];

    if (showReferralsTab) {
      defs.push({
        title: 'Referrals',
        key: 'referrals',
        contents: <ProjectReferralsTable projectId={project.id} />,
      });
    }

    if (showAvailableUnitsTab) {
      defs.push({
        title: 'Available Units',
        key: 'available-units',
        contents: <ProjectOpportunitiesTable projectId={project.id} />,
      });
    }

    if (showOutgoingReferrals) {
      defs.push({
        title: 'Sent Referrals',
        key: 'sent-referrals',
        contents: <ProjectOutgoingReferralsTable projectId={project.id} />,
      });
    }
    return defs;
  }, [
    project.id,
    showAvailableUnitsTab,
    showOutgoingReferrals,
    showReferralsTab,
  ]);

  const actions = useMemo(() => {
    if (showOutgoingReferrals) {
      return (
        <ButtonLink
          startIcon={<SendIcon />}
          to={generateSafePath(ProjectDashboardRoutes.SEND_REFERRAL, {
            projectId: project.id,
          })}
        >
          Send Referral
        </ButtonLink>
      );
    }
  }, [project.id, showOutgoingReferrals]);

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
