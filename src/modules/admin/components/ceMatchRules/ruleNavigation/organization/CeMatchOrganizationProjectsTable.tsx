import { Divider, Paper, Stack, Typography } from '@mui/material';
import { generatePath } from 'react-router-dom';

import RuleCountSummary from '../RuleCountSummary';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GetCeMatchOrganizationProjectsDocument,
  GetCeMatchOrganizationProjectsQuery,
  GetCeMatchOrganizationProjectsQueryVariables,
} from '@/types/gqlTypes';

type OrganizationProjectRow = NonNullable<
  GetCeMatchOrganizationProjectsQuery['organization']
>['projects']['nodes'][number];

const COLUMNS: DataColumnDef<
  OrganizationProjectRow,
  GetCeMatchOrganizationProjectsQueryVariables
>[] = [
  {
    header: 'Project',
    key: 'projectName',
    render: 'projectName',
  },
  {
    header: 'Effective Rules',
    key: 'effectiveRules',
    render: (project: OrganizationProjectRow) => (
      <RuleCountSummary
        total={project.effectiveCeMatchRuleCount}
        localCount={project.localCeMatchRuleCount}
      />
    ),
  },
  {
    header: 'Unit Groups',
    key: 'unitGroups',
    render: (project: OrganizationProjectRow) => project.unitGroups.nodesCount,
  },
];

/**
 * Lists CE-waitlist-enabled projects under an organization.
 */
const CeMatchOrganizationProjectsTable: React.FC<{
  organizationId: string;
  organizationName: string;
}> = ({ organizationId, organizationName }) => {
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
        columns={COLUMNS}
        rowLinkTo={(project) =>
          generatePath(AdminDashboardRoutes.CE_RULE_PROJECT, {
            projectId: project.id,
          })
        }
        rowName={(project) => project.projectName}
        rowActionTitle='View Project Rules'
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
