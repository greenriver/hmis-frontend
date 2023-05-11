import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';
import { ProjectFormTitle } from './ProjectOverview';

import useSafeParams from '@/hooks/useSafeParams';
import EditRecord from '@/modules/form/components/EditRecord';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { FormRole, ReferralRequestFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const NewReferralRequest: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useSafeParams() as { projectId: string };
  const { project } = useProjectDashboardContext();
  const title = `Request a Referral`;

  const onCompleted = useCallback(() => {
    cache.evict({
      id: `Project:${projectId}`,
      fieldName: 'referralRequests',
    });
    navigate(generateSafePath(ProjectDashboardRoutes.REFERRALS, { projectId }));
  }, [navigate, projectId]);

  return (
    <EditRecord<ReferralRequestFieldsFragment>
      FormActionProps={{ submitButtonText: 'Submit Referral Request' }}
      onCompleted={onCompleted}
      formRole={FormRole.ReferralRequest}
      inputVariables={{ projectId }}
      pickListRelationId={projectId}
      title={<ProjectFormTitle title={title} project={project} />}
    />
  );
};
export default NewReferralRequest;
