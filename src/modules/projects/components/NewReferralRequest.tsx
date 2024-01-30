import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';
import { ProjectFormTitle } from './ProjectOverview';

import useSafeParams from '@/hooks/useSafeParams';
import useAuth from '@/modules/auth/hooks/useAuth';
import EditRecord from '@/modules/form/components/EditRecord';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  RecordFormRole,
  ReferralRequestFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const NewReferralRequest: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useSafeParams() as { projectId: string };
  const { project } = useProjectDashboardContext();
  const title = `Request a Referral`;
  const { user } = useAuth();

  const onCompleted = useCallback(() => {
    cache.evict({
      id: `Project:${projectId}`,
      fieldName: 'referralRequests',
    });
    navigate(generateSafePath(ProjectDashboardRoutes.REFERRALS, { projectId }));
  }, [navigate, projectId]);

  const pickListArgs = useMemo(() => ({ projectId }), [projectId]);
  const inputVariables = useMemo(() => ({ projectId }), [projectId]);
  return (
    <EditRecord<ReferralRequestFieldsFragment>
      FormActionProps={{ submitButtonText: 'Submit Referral Request' }}
      onCompleted={onCompleted}
      formRole={RecordFormRole.ReferralRequest}
      pickListArgs={pickListArgs}
      inputVariables={inputVariables}
      title={<ProjectFormTitle title={title} project={project} />}
      localConstants={{
        userName: user?.name,
        userEmail: user?.email,
        userPhone: user?.phone,
      }}
    />
  );
};
export default NewReferralRequest;
