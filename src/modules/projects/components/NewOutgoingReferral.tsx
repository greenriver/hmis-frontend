import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';
import ProjectOutgoingReferralForm from './ProjectOutgoingReferralForm';

import { CommonCard } from '@/components/elements/CommonCard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const NewOutgoingReferral: React.FC = () => {
  const { project } = useProjectDashboardContext();
  const navigate = useNavigate();
  const onComplete = () =>
    navigate(
      generateSafePath(ProjectDashboardRoutes.REFERRALS, {
        projectId: project.id,
      })
    );

  return (
    <CommonCard title='Create Referral' sx={{ mb: 2 }}>
      <ProjectOutgoingReferralForm project={project} onComplete={onComplete} />
    </CommonCard>
  );
};
export default NewOutgoingReferral;
