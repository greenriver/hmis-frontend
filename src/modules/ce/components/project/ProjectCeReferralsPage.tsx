import React, { useMemo } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonTabs from '@/components/elements/CommonTabs';
import { SendIcon } from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import ProjectOutgoingReferralsTable from '@/modules/ce/components/directReferral/ProjectOutgoingReferralsTable';
import ProjectOpportunitiesTable from '@/modules/ce/components/project/ProjectOpportunitiesTable';
import ProjectReferralsTable from '@/modules/ce/components/project/ProjectReferralsTable';
import { useProjectCeVisibility } from '@/modules/ce/hooks/useProjectCeVisibility';
import ProjectLegacyReferrals from '@/modules/legacyReferrals/components/ProjectLegacyReferrals';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

const ProjectCeReferralsPage: React.FC = () => {
  const { project } = useProjectDashboardContext();

  const {
    showReferrals,
    showAvailableUnits,
    showOutgoingReferrals,
    showLegacyReferrals,
  } = useProjectCeVisibility(project);

  const tabDefinitions = useMemo(() => {
    const defs = [];

    if (showReferrals) {
      defs.push({
        title: 'Referrals',
        key: 'referrals',
        contents: <ProjectReferralsTable projectId={project.id} />,
      });
    }

    if (showAvailableUnits) {
      defs.push({
        title: 'Available Units',
        key: 'available-units',
        contents: <ProjectOpportunitiesTable projectId={project.id} />,
      });
    }

    if (showOutgoingReferrals) {
      defs.push({
        title: 'Outgoing Referrals',
        key: 'outgoing-referrals',
        contents: <ProjectOutgoingReferralsTable projectId={project.id} />,
      });
    }

    // TODO(#8142) fully sunset legacy referrals, remove this tab
    if (showLegacyReferrals) {
      defs.push({
        title: 'Legacy Referrals',
        key: 'legacy-referrals',
        contents: <ProjectLegacyReferrals />,
      });
    }
    return defs;
  }, [
    project,
    showAvailableUnits,
    showLegacyReferrals,
    showOutgoingReferrals,
    showReferrals,
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

  if (tabDefinitions.length === 0) {
    return <NotFound />;
  }

  return (
    <>
      <PageTitle title='Referrals (new)' actions={actions} />
      <CommonTabs
        ariaLabel={'Project CE Tabs'}
        tabDefinitions={tabDefinitions}
      />
    </>
  );
};

export default ProjectCeReferralsPage;
