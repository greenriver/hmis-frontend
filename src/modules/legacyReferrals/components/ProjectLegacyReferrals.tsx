import AddIcon from '@mui/icons-material/Add';
import { Stack } from '@mui/material';

import ProjectOutgoingReferralPostingsTable from './ProjectOutgoingReferralPostingsTable';
import ProjectReferralPostingsTable from './ProjectReferralPostingsTable';
import ProjectReferralRequestsTable from './ProjectReferralRequestsTable';

import ButtonLink from '@/components/elements/ButtonLink';
import TitleCard from '@/components/elements/TitleCard';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

/**
 * This component is used to show the legacy referrals page.
 *
 * If the project has CE referrals enabled, it disables the ability to create
 * new legacy referrals and referral requests.
 * TODO(#8142) fully sunset legacy referrals, remove this tab
 */
const ProjectLegacyReferrals = () => {
  const { globalFeatureFlags: { externalReferralsEnabled } = {} } =
    useGlobalFeatureFlags();
  const { project } = useProjectDashboardContext();

  // If this project has CE Referrals enabled (either Direct or Waitlist),
  // hide functions to create new legacy referrals and referral requests.
  const { supportsReferrals, sendsDirectReferrals } =
    project.coordinatedEntryFeatures || {};
  const allowCreatingNewReferrals = !supportsReferrals && !sendsDirectReferrals;

  return (
    <Stack spacing={4}>
      {project.access.canManageOutgoingReferrals && (
        <TitleCard
          title='Outgoing Referrals'
          headerVariant='border'
          actions={
            allowCreatingNewReferrals && (
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
            )
          }
        >
          <ProjectOutgoingReferralPostingsTable projectId={project.id} />
        </TitleCard>
      )}
      {project.access.canManageIncomingReferrals && (
        <>
          {/* Referral Requests are only used for external integration */}
          {externalReferralsEnabled && (
            <TitleCard
              title='Referral Requests'
              headerVariant='border'
              actions={
                allowCreatingNewReferrals && (
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
                )
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
              externalReferrals={externalReferralsEnabled}
            />
          </TitleCard>
        </>
      )}
    </Stack>
  );
};
export default ProjectLegacyReferrals;
