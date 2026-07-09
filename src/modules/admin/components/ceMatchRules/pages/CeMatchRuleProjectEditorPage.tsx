import { useCallback, useEffect } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import CeMatchRuleForm from '../editor/CeMatchRuleForm';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useAdminDashboardContext } from '@/modules/admin/components/AdminDashboard';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  CeMatchRuleOwnerType,
  useGetCeMatchProjectRulesQuery,
} from '@/types/gqlTypes';

const CeMatchRuleProjectEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useSafeParams<{ projectId?: string }>();
  const { overrideBreadcrumbTitles } = useAdminDashboardContext();
  const { data, loading, error } = useGetCeMatchProjectRulesQuery({
    variables: { id: projectId || '' },
    skip: !projectId,
  });

  const project = data?.project;

  const returnToRulesOverview = useCallback(() => {
    if (!projectId) return;

    navigate(
      generatePath(AdminDashboardRoutes.CE_RULE_PROJECT, {
        projectId,
      })
    );
  }, [navigate, projectId]);

  useEffect(() => {
    if (!project) return;

    overrideBreadcrumbTitles({
      [AdminDashboardRoutes.CE_RULE_PROJECT]: project.projectName,
    });
  }, [project, overrideBreadcrumbTitles]);

  if (!projectId) return <NotFound />;
  if (error) return <ApolloErrorAlert error={error} />;
  if (loading && !project) return <Loading />;
  if (!project) return <NotFound />;

  return (
    <>
      <PageTitle
        overlineText='Coordinated Entry Rules'
        title='Add Project Rule'
      />
      <CeMatchRuleForm
        ownerType={CeMatchRuleOwnerType.Project}
        ownerId={projectId}
        ownerName={project.projectName}
        onSaved={returnToRulesOverview}
        onCancel={returnToRulesOverview}
      />
    </>
  );
};

export default CeMatchRuleProjectEditorPage;
