import AddIcon from '@mui/icons-material/Add';
import { Stack } from '@mui/material';

import ProjectOutgoingReferralPostingsTable from './ProjectOutgoingReferralPostingsTable';
import ProjectReferralPostingsTable from './ProjectReferralPostingsTable';
import ProjectReferralRequestsTable from './ProjectReferralRequestsTable';

import ButtonLink from '@/components/elements/ButtonLink';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

const ProjectReferralsPage = () => {
  const { globalFeatureFlags: { externalReferrals } = {} } =
    useHmisAppSettings();
  const { project } = useProjectDashboardContext();

  return (
    <>
      <PageTitle title='Referrals' />
      <Stack spacing={4}>
        {project.access.canManageOutgoingReferrals && (
          <TitleCard
            title='Outgoing Referrals'
            headerVariant='border'
            actions={
              <ButtonLink
                to={generateSafePath(
                  ProjectDashboardRoutes.NEW_OUTGOING_REFERRAL,
                  {
                    projectId: project.id,
                  }
                )}
                Icon={AddIcon}
              >
                New Referral
              </ButtonLink>
            }
          >
            <ProjectOutgoingReferralPostingsTable projectId={project.id} />
          </TitleCard>
        )}
        {project.access.canManageIncomingReferrals && (
          <>
            {/* Referral Requests are only used for external integration */}
            {externalReferrals && (
              <TitleCard
                title='Referral Requests'
                headerVariant='border'
                actions={
                  <ButtonLink
                    to={generateSafePath(
                      ProjectDashboardRoutes.NEW_REFERRAL_REQUEST,
                      {
                        projectId: project.id,
                      }
                    )}
                    Icon={AddIcon}
                  >
                    New Referral Request
                  </ButtonLink>
                }
              >
                <ProjectReferralRequestsTable project={project} />
              </TitleCard>
            )}
            <TitleCard
              title={
                // If user is seeing both Outgoing+Incoming, call this "Incoming" to make the difference more obvious.
                // If user only sees incoming referrals (AC providers), leave it as "Active Referrals".
                project.access.canManageOutgoingReferrals
                  ? 'Incoming Referrals'
                  : 'Active Referrals'
              }
              headerVariant='border'
            >
              <ProjectReferralPostingsTable
                projectId={project.id}
                externalReferrals={externalReferrals}
              />
            </TitleCard>
          </>
        )}
      </Stack>
    </>
  );
};
export default ProjectReferralsPage;
