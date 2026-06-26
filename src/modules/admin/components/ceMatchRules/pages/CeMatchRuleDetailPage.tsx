import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CeMatchRuleDeleteDialog from '../CeMatchRuleDeleteDialog';
import {
  getCeMatchRuleOwnerLevelByOwnerType,
  ceMatchRuleOwnerLevelConfigs,
} from '../ceMatchRuleOwnerLevelConfig';
import CeMatchRuleForm from '../editor/CeMatchRuleForm';
import { ceMatchRuleToFormValues } from '../editor/ceMatchRuleFormUtil';
import Loading from '@/components/elements/Loading';
import { useAdminBreadcrumbConfig } from '@/components/layout/dashboard/contextHeader/useDashboardBreadcrumbs';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useCurrentPath from '@/hooks/useCurrentPath';
import useSafeParams from '@/hooks/useSafeParams';
import { useAdminDashboardContext } from '@/modules/admin/components/AdminDashboard';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { useGetCeMatchRuleQuery } from '@/types/gqlTypes';

const CeMatchRuleDetailPage: React.FC = () => {
  const { ruleId } = useSafeParams<{ ruleId?: string }>();
  const navigate = useNavigate();
  const { overrideBreadcrumbTitles } = useAdminDashboardContext();
  const breadcrumbConfig = useAdminBreadcrumbConfig();
  const currentPath = useCurrentPath();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: ruleData,
    loading: ruleLoading,
    error: ruleError,
  } = useGetCeMatchRuleQuery({
    variables: { id: ruleId || '' },
    skip: !ruleId,
    fetchPolicy: 'cache-and-network',
  });
  const rule = ruleData?.ceMatchRule;

  const returnToOwnerRules = useCallback(() => {
    if (!rule) return;
    const ownerLevel = getCeMatchRuleOwnerLevelByOwnerType(rule.ownerType);
    const ruleOwnerPath = ceMatchRuleOwnerLevelConfigs[ownerLevel].getRulesPath(
      {
        ownerId: rule.ownerId || undefined,
      }
    );
    navigate(ruleOwnerPath);
  }, [navigate, rule]);

  const initialValues = useMemo(() => {
    if (!rule) return undefined;
    return ceMatchRuleToFormValues(rule);
  }, [rule]);

  useEffect(() => {
    // Override the parent breadcrumb title to the rule owner name
    const parentPath = currentPath
      ? breadcrumbConfig[currentPath]?.parent
      : undefined;
    if (!rule?.ownerId || !parentPath) return;

    overrideBreadcrumbTitles({
      [parentPath]: rule.ownerName,
    });
  }, [breadcrumbConfig, currentPath, overrideBreadcrumbTitles, rule]);

  if (!ruleId) return <NotFound />;
  if (ruleError) return <ApolloErrorAlert error={ruleError} />;
  if (ruleLoading && !rule) return <Loading />;
  if (!rule) return <NotFound />;

  return (
    <>
      <PageTitle overlineText='Coordinated Entry Rules' title={rule.name} />
      <CeMatchRuleForm
        ruleId={rule.id}
        initialValues={initialValues}
        ownerType={rule.ownerType}
        ownerId={rule.ownerId}
        ownerName={rule.ownerName}
        onSaved={returnToOwnerRules}
        onDelete={() => setDeleteDialogOpen(true)}
      />
      <CeMatchRuleDeleteDialog
        ruleId={rule.id}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleted={returnToOwnerRules}
      />
    </>
  );
};

export default CeMatchRuleDetailPage;
