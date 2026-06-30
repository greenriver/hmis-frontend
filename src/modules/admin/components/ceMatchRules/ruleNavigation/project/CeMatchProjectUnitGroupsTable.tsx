import { Divider, Paper, Stack, Typography } from '@mui/material';
import { generatePath } from 'react-router-dom';

import RuleCountSummary from '../RuleCountSummary';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { AdminDashboardRoutes, ProjectDashboardRoutes } from '@/routes/routes';
import {
  GetCeMatchProjectUnitGroupsDocument,
  GetCeMatchProjectUnitGroupsQuery,
  GetCeMatchProjectUnitGroupsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
    render: (unitGroup: ProjectUnitGroupRow) => (
      <RuleCountSummary
        total={unitGroup.effectiveCeMatchRuleCount}
        localCount={unitGroup.localCeMatchRuleCount}
      />
    ),
  },
];

/**
 * Lists unit groups under a project with information about their effective CE rules.
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
        rowLinkTo={(unitGroup) =>
          generatePath(AdminDashboardRoutes.CE_RULE_UNIT_GROUP, {
            unitGroupId: unitGroup.id,
          })
        }
        rowName={(unitGroup) => unitGroup.name}
        rowActionTitle='View Unit Group Rules'
        rowSecondaryActionConfigs={(unitGroup) => [
          {
            title: 'View Unit Group',
            key: 'viewUnitGroup',
            ariaLabel: `View Unit Group, ${unitGroup.name}`,
            to: generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
              projectId: unitGroup.projectId,
              unitGroupId: unitGroup.id,
            }),
          },
        ]}
        noData='No unit groups'
        pagePath='project.unitGroups'
        recordType='Unit Group'
        queryVariables={{ id: projectId }}
        noSort
      />
    </Paper>
  );
};

export default CeMatchProjectUnitGroupsTable;
