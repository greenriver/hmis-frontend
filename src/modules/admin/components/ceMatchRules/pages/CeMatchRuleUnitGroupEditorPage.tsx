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
  useGetCeMatchUnitGroupRulesQuery,
} from '@/types/gqlTypes';

const CeMatchRuleUnitGroupEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { unitGroupId } = useSafeParams<{ unitGroupId?: string }>();
  const { overrideBreadcrumbTitles } = useAdminDashboardContext();
  const { data, loading, error } = useGetCeMatchUnitGroupRulesQuery({
    variables: { id: unitGroupId || '' },
    skip: !unitGroupId,
    fetchPolicy: 'cache-first',
  });

  const unitGroup = data?.unitGroup;

  const returnToRulesOverview = useCallback(() => {
    if (!unitGroupId) return;

    navigate(
      generatePath(AdminDashboardRoutes.CE_RULE_UNIT_GROUP, {
        unitGroupId,
      })
    );
  }, [navigate, unitGroupId]);

  useEffect(() => {
    if (!unitGroup) return;

    overrideBreadcrumbTitles({
      [AdminDashboardRoutes.CE_RULE_UNIT_GROUP]: unitGroup.name,
    });
  }, [unitGroup, overrideBreadcrumbTitles]);

  if (!unitGroupId) return <NotFound />;
  if (error) return <ApolloErrorAlert error={error} />;
  if (loading && !unitGroup) return <Loading />;
  if (!unitGroup) return <NotFound />;

  return (
    <>
      <PageTitle
        overlineText='Coordinated Entry Rules'
        title='Add Unit Group Rule'
      />
      <CeMatchRuleForm
        ownerType={CeMatchRuleOwnerType.UnitGroup}
        ownerId={unitGroupId}
        ownerName={unitGroup.name}
        onSaved={returnToRulesOverview}
        onCancel={returnToRulesOverview}
      />
    </>
  );
};

export default CeMatchRuleUnitGroupEditorPage;
