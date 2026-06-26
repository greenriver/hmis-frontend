import { Stack } from '@mui/material';
import { useEffect } from 'react';

import CeMatchEffectiveRulesCard from '../ruleGroups/CeMatchEffectiveRulesCard';
import CeMatchRuleGroupsAccordion from '../ruleGroups/CeMatchRuleGroupsAccordion';
import {
  getCeMatchRuleGroupCount,
  getCeMatchRuleGroupLabel,
  getCeMatchRuleGroupPath,
} from '../ruleGroups/ceMatchRuleGroupUtil';
import CeMatchProjectUnitGroupsTable from '../ruleNavigation/project/CeMatchProjectUnitGroupsTable';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useAdminDashboardContext } from '@/modules/admin/components/AdminDashboard';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { AdminDashboardRoutes, ProjectDashboardRoutes } from '@/routes/routes';
import { useGetCeMatchProjectRulesQuery } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

/**
 * Displays effective CE rules for a selected project, and lists its unit groups.
 */
const CeMatchProjectRulesPage: React.FC = () => {
  const { projectId } = useSafeParams<{ projectId?: string }>();
  const { data, loading, error } = useGetCeMatchProjectRulesQuery({
    variables: { id: projectId || '' },
    skip: !projectId,
    fetchPolicy: 'cache-and-network',
  });
  const project = data?.project;
  const { overrideBreadcrumbTitles } = useAdminDashboardContext();

  useEffect(() => {
    if (!project) return;

    overrideBreadcrumbTitles({
      [AdminDashboardRoutes.CE_RULE_PROJECT]: project.projectName,
    });
  }, [project, overrideBreadcrumbTitles]);

  if (!projectId) return <NotFound />;
  if (error) return <ApolloErrorAlert error={error} />;
  if (loading && !data) return <Loading />;
  if (!project) return <NotFound />;

  return (
    <>
      <PageTitle overlineText='Project Rules' title={project.projectName} />
      <Stack gap={3}>
        <CeMatchEffectiveRulesCard
          ownerName={project.projectName}
          ownerTo={generateSafePath(ProjectDashboardRoutes.UNITS, {
            projectId: project.id,
          })}
          effectiveRulesCount={project.effectiveCeMatchRuleCount}
          ruleCountSummaries={project.effectiveCeMatchRuleGroups.map(
            (group) => ({
              label: getCeMatchRuleGroupLabel(group),
              count: getCeMatchRuleGroupCount(group),
              to: group.local ? undefined : getCeMatchRuleGroupPath(group),
            })
          )}
        >
          <CeMatchRuleGroupsAccordion
            ruleGroups={project.effectiveCeMatchRuleGroups}
          />
        </CeMatchEffectiveRulesCard>
        <CeMatchProjectUnitGroupsTable
          projectId={project.id}
          projectName={project.projectName}
        />
      </Stack>
    </>
  );
};

export default CeMatchProjectRulesPage;
