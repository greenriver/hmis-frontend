import { useProjectDashboardContext } from './ProjectDashboard';
import ProjectOutgoingReferralForm from './ProjectOutgoingReferralForm';

import { CommonCard } from '@/components/elements/CommonCard';

const NewOutgoingReferral: React.FC = () => {
  const { project } = useProjectDashboardContext();
  return (
    <CommonCard title='Create Referral' sx={{ mb: 2 }}>
      <ProjectOutgoingReferralForm project={project} />
    </CommonCard>
  );
};
export default NewOutgoingReferral;
