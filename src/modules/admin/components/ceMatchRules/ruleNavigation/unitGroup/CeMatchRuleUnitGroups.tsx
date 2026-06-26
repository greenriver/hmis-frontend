import { Paper, Stack, Typography } from '@mui/material';
import { generatePath } from 'react-router-dom';

import RuleCountSummary from '../RuleCountSummary';
import useDebouncedState from '@/hooks/useDebouncedState';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import { AdminDashboardRoutes, ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeMatchRuleUnitGroupFieldsFragment,
  GetCeMatchRuleUnitGroupsDocument,
  GetCeMatchRuleUnitGroupsQuery,
  GetCeMatchRuleUnitGroupsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const UNIT_GROUP_COLUMNS: DataColumnDef<
  CeMatchRuleUnitGroupFieldsFragment,
  GetCeMatchRuleUnitGroupsQueryVariables
>[] = [
  {
    header: 'Unit Group',
    key: 'name',
    render: 'name',
  },
  {
    header: 'Rules',
    key: 'effectiveCeMatchRuleCount',
    render: (unitGroup) => (
      <RuleCountSummary
        total={unitGroup.effectiveCeMatchRuleCount}
        localCount={unitGroup.localCeMatchRuleCount}
      />
    ),
  },
  {
    header: 'Project',
    key: 'projectName',
    render: (unitGroup) => unitGroup.project.projectName,
  },
];

/**
 * Shows the Unit Group owner-level tab where users choose a unit group to view its CE rules.
 */
const CeMatchRuleUnitGroups: React.FC = () => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

  return (
    <Stack gap={2}>
      <Stack gap={1}>
        <Typography variant='h4' component='h2'>
          Unit Group Rules
        </Typography>
        <Typography variant='body2'>
          Select a Unit Group to review effective rules and manage Unit
          Group-specific rules.
        </Typography>
      </Stack>
      <CommonSearchInput
        label='Search Unit Groups'
        name='search unit groups'
        placeholder='Search by unit group name or project name'
        value={search}
        onChange={setSearch}
        fullWidth
        size='small'
        searchAdornment
        clearAdornment
        helperText='To appear here, unit groups must be in a project with waitlist referrals enabled, and have a referral template.'
      />
      <Paper>
        <GenericTableWithData<
          GetCeMatchRuleUnitGroupsQuery,
          GetCeMatchRuleUnitGroupsQueryVariables,
          CeMatchRuleUnitGroupFieldsFragment
        >
          queryDocument={GetCeMatchRuleUnitGroupsDocument}
          columns={UNIT_GROUP_COLUMNS}
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
                projectId: unitGroup.project.id,
                unitGroupId: unitGroup.id,
              }),
            },
          ]}
          noData={
            debouncedSearch
              ? 'No unit groups found'
              : 'No unit groups with waitlist referrals enabled'
          }
          pagePath='unitGroups'
          recordType='Unit Group'
          queryVariables={{
            filters: {
              searchTerm: debouncedSearch || undefined,
              ceWaitlistsEnabled: true,
            },
          }}
          noSort
        />
      </Paper>
    </Stack>
  );
};

export default CeMatchRuleUnitGroups;
