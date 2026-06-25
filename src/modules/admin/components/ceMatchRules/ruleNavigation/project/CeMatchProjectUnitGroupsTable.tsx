import { Divider, Paper, Stack, Typography } from '@mui/material';

import RuleCountSummary from '../RuleCountSummary';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import {
  GetCeMatchProjectUnitGroupsDocument,
  GetCeMatchProjectUnitGroupsQuery,
  GetCeMatchProjectUnitGroupsQueryVariables,
} from '@/types/gqlTypes';

type ProjectUnitGroupRow = NonNullable<
  GetCeMatchProjectUnitGroupsQuery['project']
>['unitGroups']['nodes'][number];

const COLUMNS: DataColumnDef<
  ProjectUnitGroupRow,
  GetCeMatchProjectUnitGroupsQueryVariables
>[] = [
  {
    header: 'Unit Group Name',
    key: 'name',
    render: 'name',
  },
  {
    header: 'Effective Rules',
    key: 'effectiveRules',
    render: () => (
      <RuleCountSummary
        // TODO(#7544): Add correct counts when available
        total={0}
        inheritedCount={0}
      />
    ),
  },
];

/**
 * Lists unit groups under a project as the next scaffolded CE rule owner level.
 */
const CeMatchProjectUnitGroupsTable: React.FC<{
  projectId: string;
  projectName: string;
}> = ({ projectId, projectName }) => {
  return (
    <Paper>
      <Stack gap={1} p={2} pb={0}>
        <Typography variant='cardTitle' component='h2' fontWeight='600'>
          Unit Groups at {projectName}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Inherit Global, Organization and Project Rules
        </Typography>
      </Stack>
      <Divider sx={{ mt: 2 }} />
      <GenericTableWithData<
        GetCeMatchProjectUnitGroupsQuery,
        GetCeMatchProjectUnitGroupsQueryVariables,
        ProjectUnitGroupRow
      >
        queryDocument={GetCeMatchProjectUnitGroupsDocument}
        columns={COLUMNS}
        rowName={(unitGroup) => unitGroup.name}
        noData='No unit groups'
        pagePath='project.unitGroups'
        recordType='Unit Group'
        defaultPageSize={10}
        queryVariables={{ id: projectId }}
        noSort
      />
    </Paper>
  );
};

export default CeMatchProjectUnitGroupsTable;
