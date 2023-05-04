import { useProjectDashboardContext } from './ProjectDashboard';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const ProjectReferrals = () => {
  const { project } = useProjectDashboardContext();

  return (
    <>
      <PageTitle title='Referrals' />
      {/* FIXME: this should be a different permission specifically for referral requests probably? */}
      {project.access.canEditProjectDetails && (
        <ButtonLink
          to={generateSafePath(ProjectDashboardRoutes.NEW_REFERRAL_REQUEST, {
            projectId: project.id,
          })}
        >
          Request a Referral
        </ButtonLink>
      )}
      {/* TODO: Render a GenericTableWithData for ReferralRequests */}
      {/* TODO: Render a GenericTableWithData for Referrals */}
    </>
  );
};
export default ProjectReferrals;
