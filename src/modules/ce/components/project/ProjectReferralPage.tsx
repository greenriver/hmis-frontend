import React from 'react';
import ReferralPage from '@/modules/ce/components/referral/ReferralPage';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

interface Props {}

/**
 * Wraps ReferralPage when it is in the Project context
 */
const ProjectReferralPage: React.FC<Props> = ({}) => {
  const { project } = useProjectDashboardContext();

  return <ReferralPage project={project} />;
};

export default ProjectReferralPage;
