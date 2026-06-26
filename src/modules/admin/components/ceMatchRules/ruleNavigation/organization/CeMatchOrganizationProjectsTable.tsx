import { Divider, Paper, Stack, Typography } from '@mui/material';

import { useMemo } from 'react';
import RuleCountSummary from '../RuleCountSummary';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import {
  GetCeMatchOrganizationProjectsDocument,
  GetCeMatchOrganizationProjectsQuery,
  GetCeMatchOrganizationProjectsQueryVariables,
} from '@/types/gqlTypes';

type OrganizationProjectRow = NonNullable<
  GetCeMatchOrganizationProjectsQuery['organization']
>['projects']['nodes'][number];

/**
 * Lists CE-waitlist-enabled projects under an organization.
 */
const CeMatchOrganizationProjectsTable: React.FC<{
  organizationId: string;
  organizationName: string;
  inheritedRuleCount: number;
}> = ({ organizationId, organizationName, inheritedRuleCount }) => {
  const projectColumns: DataColumnDef<
    OrganizationProjectRow,
    GetCeMatchOrganizationProjectsQueryVariables
  >[] = useMemo(() => {
    return [
      {
        header: 'Project',
        key: 'projectName',
        render: 'projectName',
      },
      {
        header: 'Effective Rules',
        key: 'effectiveRules',
        render: () => (
          <RuleCountSummary
            // TODO(#7544) update this with the local project rule count, once available
            total={inheritedRuleCount}
            inheritedCount={inheritedRuleCount}
          />
        ),
      },
      {
        header: 'Unit Groups',
        key: 'unitGroups',
        render: (project: OrganizationProjectRow) =>
          project.unitGroups.nodesCount,
      },
    ];
  }, [inheritedRuleCount]);

  return (
    <Paper>
      <Stack gap={1} p={2} pb={0}>
        <Typography variant='cardTitle' component='h2' fontWeight='600'>
          Projects at {organizationName}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Inherit Global and Organization Rules
        </Typography>
      </Stack>
      <Divider sx={{ mt: 2 }} />
      <GenericTableWithData<
        GetCeMatchOrganizationProjectsQuery,
        GetCeMatchOrganizationProjectsQueryVariables,
        OrganizationProjectRow
      >
        queryDocument={GetCeMatchOrganizationProjectsDocument}
        columns={projectColumns}
        rowName={(project) => project.projectName}
        noData='No projects'
        pagePath='organization.projects'
        recordType='Project'
        defaultPageSize={10}
        queryVariables={{
          id: organizationId,
          filters: {
            ceWaitlistsEnabled: true,
          },
        }}
        noSort
      />
    </Paper>
  );
};

export default CeMatchOrganizationProjectsTable;
