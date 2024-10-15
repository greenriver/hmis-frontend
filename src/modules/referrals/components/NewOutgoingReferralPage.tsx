import ProjectOutgoingReferralForm from './ProjectOutgoingReferralForm';

import PageTitle from '@/components/layout/PageTitle';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

const NewOutgoingReferralPage: React.FC = () => {
  const { project } = useProjectDashboardContext();

  return (
    <>
      <PageTitle title='Create Referral' />
      <ProjectOutgoingReferralForm project={project} />
    </>
  );
};
export default NewOutgoingReferralPage;
