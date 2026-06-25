import { Stack } from '@mui/material';
import { useEffect } from 'react';

import CeMatchEffectiveRulesCard from '../ruleGroups/CeMatchEffectiveRulesCard';
import CeMatchRuleGroupsAccordion from '../ruleGroups/CeMatchRuleGroupsAccordion';
import {
  getCeMatchRuleGroupCount,
  getCeMatchRuleGroupLabel,
  getCeMatchRuleGroupPath,
} from '../ruleGroups/ceMatchRuleGroupUtil';
import CeMatchOrganizationProjectsTable from '../ruleNavigation/organization/CeMatchOrganizationProjectsTable';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useAdminDashboardContext } from '@/modules/admin/components/AdminDashboard';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { AdminDashboardRoutes } from '@/routes/routes';
import { useGetCeMatchOrganizationRulesQuery } from '@/types/gqlTypes';

/**
 * Displays effective CE rules for a selected organization and its descendants.
 */
const CeMatchOrganizationRulesPage: React.FC = () => {
  const { organizationId } = useSafeParams<{ organizationId?: string }>();
  const { data, loading, error } = useGetCeMatchOrganizationRulesQuery({
    variables: { id: organizationId || '' },
    skip: !organizationId,
    fetchPolicy: 'cache-and-network',
  });
  const organization = data?.organization;
  const { overrideBreadcrumbTitles } = useAdminDashboardContext();

  useEffect(() => {
    if (!organization) return;

    overrideBreadcrumbTitles({
      [AdminDashboardRoutes.CE_RULE_ORGANIZATION]:
        organization.organizationName,
    });
  }, [organization, overrideBreadcrumbTitles]);

  if (!organizationId) return <NotFound />;
  if (error) return <ApolloErrorAlert error={error} />;
  if (loading && !data) return <Loading />;
  if (!organization) return <NotFound />;

  return (
    <>
      <PageTitle
        overlineText='Organization Rules'
        title={organization.organizationName}
      />
      <Stack gap={3}>
        <CeMatchEffectiveRulesCard
          ownerName={organization.organizationName}
          effectiveRulesCount={organization.effectiveCeMatchRuleCount}
          ruleCountSummaries={organization.effectiveCeMatchRuleGroups.map(
            (group) => ({
              label: getCeMatchRuleGroupLabel(group),
              count: getCeMatchRuleGroupCount(group),
              to: group.local ? undefined : getCeMatchRuleGroupPath(group),
            })
          )}
        >
          <CeMatchRuleGroupsAccordion
            ruleGroups={organization.effectiveCeMatchRuleGroups}
          />
        </CeMatchEffectiveRulesCard>
        <CeMatchOrganizationProjectsTable
          organizationId={organization.id}
          organizationName={organization.organizationName}
          inheritedRuleCount={organization.effectiveCeMatchRuleCount}
        />
      </Stack>
    </>
  );
};

export default CeMatchOrganizationRulesPage;
