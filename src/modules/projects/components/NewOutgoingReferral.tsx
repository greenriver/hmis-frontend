import { useProjectDashboardContext } from './ProjectDashboard';
import ProjectOutgoingReferralForm from './ProjectOutgoingReferralForm';

import PageTitle from '@/components/layout/PageTitle';

const NewOutgoingReferral: React.FC = () => {
  const { project } = useProjectDashboardContext();

  return (
    <>
      <PageTitle title='Create Referral' />
      <ProjectOutgoingReferralForm project={project} />
    </>
  );
};
export default NewOutgoingReferral;
