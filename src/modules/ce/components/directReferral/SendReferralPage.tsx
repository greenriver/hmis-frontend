import React from 'react';
import PageTitle from '@/components/layout/PageTitle';
import SendReferralForm from '@/modules/ce/components/directReferral/SendReferralForm';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

const SendReferralPage: React.FC = () => {
  const { project } = useProjectDashboardContext();

  return (
    <>
      <PageTitle title='Send Referral' />
      <SendReferralForm project={project} />
    </>
  );
};

export default SendReferralPage;
