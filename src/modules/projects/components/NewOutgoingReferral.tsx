import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';
import ProjectOutgoingReferralForm from './ProjectOutgoingReferralForm';

import PageTitle from '@/components/layout/PageTitle';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

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
    <>
      <PageTitle title='Create Referral' />
      <ProjectOutgoingReferralForm project={project} onComplete={onComplete} />
    </>
  );
};
export default NewOutgoingReferral;
