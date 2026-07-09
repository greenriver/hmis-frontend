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
  useGetCeMatchOrganizationRulesQuery,
} from '@/types/gqlTypes';

const CeMatchRuleOrganizationEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { organizationId } = useSafeParams<{ organizationId?: string }>();
  const { overrideBreadcrumbTitles } = useAdminDashboardContext();
  const { data, loading, error } = useGetCeMatchOrganizationRulesQuery({
    variables: { id: organizationId || '' },
    skip: !organizationId,
    fetchPolicy: 'cache-first',
  });

  const organization = data?.organization;

  const returnToRulesOverview = useCallback(() => {
    if (!organizationId) return;

    navigate(
      generatePath(AdminDashboardRoutes.CE_RULE_ORGANIZATION, {
        organizationId,
      })
    );
  }, [navigate, organizationId]);

  useEffect(() => {
    if (!organization?.organizationName) return;

    overrideBreadcrumbTitles({
      [AdminDashboardRoutes.CE_RULE_ORGANIZATION]:
        organization.organizationName,
    });
  }, [organization?.organizationName, overrideBreadcrumbTitles]);

  if (!organizationId) return <NotFound />;
  if (error) return <ApolloErrorAlert error={error} />;
  if (loading && !organization) return <Loading />;
  if (!organization) return <NotFound />;

  return (
    <>
      <PageTitle
        overlineText='Coordinated Entry Rules'
        title='Add Organization Rule'
      />
      <CeMatchRuleForm
        ownerType={CeMatchRuleOwnerType.Organization}
        ownerId={organizationId}
        ownerName={organization.organizationName}
        onSaved={returnToRulesOverview}
        onCancel={returnToRulesOverview}
      />
    </>
  );
};

export default CeMatchRuleOrganizationEditorPage;
