import { Stack } from '@mui/material';
import { useEffect } from 'react';

import CeMatchEffectiveRulesCard from '../ruleGroups/CeMatchEffectiveRulesCard';
import CeMatchRuleGroupsAccordion from '../ruleGroups/CeMatchRuleGroupsAccordion';
import {
  getCeMatchRuleGroupCount,
  getCeMatchRuleGroupLabel,
  getCeMatchRuleGroupPath,
} from '../ruleGroups/ceMatchRuleGroupUtil';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useAdminDashboardContext } from '@/modules/admin/components/AdminDashboard';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { AdminDashboardRoutes } from '@/routes/routes';
import { useGetCeMatchUnitGroupRulesQuery } from '@/types/gqlTypes';

/**
 * Displays effective CE rules for a selected unit group.
 */
const CeMatchUnitGroupRulesPage: React.FC = () => {
  const { unitGroupId } = useSafeParams<{ unitGroupId?: string }>();
  const { data, loading, error } = useGetCeMatchUnitGroupRulesQuery({
    variables: { id: unitGroupId || '' },
    skip: !unitGroupId,
    fetchPolicy: 'cache-and-network',
  });
  const unitGroup = data?.unitGroup;
  const { overrideBreadcrumbTitles } = useAdminDashboardContext();

  useEffect(() => {
    if (!unitGroup) return;

    overrideBreadcrumbTitles({
      [AdminDashboardRoutes.CE_RULE_UNIT_GROUP]: unitGroup.name,
    });
  }, [unitGroup, overrideBreadcrumbTitles]);

  if (!unitGroupId) return <NotFound />;
  if (error) return <ApolloErrorAlert error={error} />;
  if (loading && !data) return <Loading />;
  if (!unitGroup) return <NotFound />;

  return (
    <>
      <PageTitle overlineText='Unit Group Rules' title={unitGroup.name} />
      <Stack gap={3}>
        <CeMatchEffectiveRulesCard
          ownerName={unitGroup.name}
          effectiveRulesCount={unitGroup.effectiveCeMatchRuleCount}
          ruleCountSummaries={unitGroup.effectiveCeMatchRuleGroups.map(
            (group) => ({
              label: getCeMatchRuleGroupLabel(group),
              count: getCeMatchRuleGroupCount(group),
              to: group.local ? undefined : getCeMatchRuleGroupPath(group),
            })
          )}
        >
          <CeMatchRuleGroupsAccordion
            ruleGroups={unitGroup.effectiveCeMatchRuleGroups}
          />
        </CeMatchEffectiveRulesCard>
      </Stack>
    </>
  );
};

export default CeMatchUnitGroupRulesPage;
