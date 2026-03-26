import { Stack } from '@mui/material';

import ProjectOutgoingReferralPostingsTable from './ProjectOutgoingReferralPostingsTable';
import ProjectReferralPostingsTable from './ProjectReferralPostingsTable';

import TitleCard from '@/components/elements/TitleCard';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

/**
 * Legacy referrals tab:
 * - Legacy Outgoing Referrals: read-only history (no new legacy referrals can be sent).
 * - Legacy Incoming Referrals: view and update status (e.g. accept/deny) of existing referrals.
 *
 * TODO(#8142) fully sunset legacy referrals, remove this tab
 */
const ProjectLegacyReferrals = () => {
  const { globalFeatureFlags: { externalReferralsEnabled } = {} } =
    useGlobalFeatureFlags();
  const { project } = useProjectDashboardContext();

  return (
    <Stack spacing={4}>
      {project.access.canManageOutgoingReferrals && (
        <TitleCard title='Outgoing Referrals' headerVariant='border'>
          <ProjectOutgoingReferralPostingsTable projectId={project.id} />
        </TitleCard>
      )}
      {project.access.canManageIncomingReferrals && (
        <>
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
