import { Paper, Stack, Typography } from '@mui/material';

import { ceMatchRuleOwnerLevelConfigs } from '../../ceMatchRuleOwnerLevelConfig';
import RuleCountSummary from '../RuleCountSummary';
import useDebouncedState from '@/hooks/useDebouncedState';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import {
  CeMatchRuleUnitGroupFieldsFragment,
  GetCeMatchRuleUnitGroupsDocument,
  GetCeMatchRuleUnitGroupsQuery,
  GetCeMatchRuleUnitGroupsQueryVariables,
} from '@/types/gqlTypes';

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
    render: (unitGroup) => {
      const inheritedCount =
        unitGroup.effectiveCeMatchRuleCount - unitGroup.localCeMatchRuleCount;

      return (
        <RuleCountSummary
          total={unitGroup.effectiveCeMatchRuleCount}
          localCount={unitGroup.localCeMatchRuleCount}
          inheritedCount={inheritedCount}
        />
      );
    },
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
        placeholder='Search by unit group name'
        value={search}
        onChange={setSearch}
        fullWidth
        size='small'
        searchAdornment
        clearAdornment
        helperText='Only unit groups in projects with waitlist referrals enabled will appear.'
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
            ceMatchRuleOwnerLevelConfigs['unit-group'].getRulesPath({
              ownerId: unitGroup.id,
            })
          }
          rowName={(unitGroup) => unitGroup.name}
          rowActionTitle='View Unit Group Rules'
          noData='No unit groups with waitlist referrals enabled'
          pagePath='unitGroups'
          recordType='Unit Group'
          defaultPageSize={10}
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
