import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';
import { ProjectFormTitle } from './ProjectOverview';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { FormRole, ReferralPostingFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const NewOutgoingReferral: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useSafeParams() as { projectId: string };
  const { project } = useProjectDashboardContext();
  const title = 'Create New Referral';

  const onCompleted = useCallback(() => {
    navigate(generateSafePath(ProjectDashboardRoutes.REFERRALS, { projectId }));
  }, [navigate, projectId]);

  return (
    <EditRecord<ReferralPostingFieldsFragment>
      FormActionProps={{ submitButtonText: 'Create Referral' }}
      onCompleted={onCompleted}
      formRole={FormRole.ReferralPosting}
      inputVariables={{ projectId }}
      pickListRelationId={projectId}
      title={<ProjectFormTitle title={title} project={project} />}
    />
  );
};
export default NewOutgoingReferral;
