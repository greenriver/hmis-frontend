import { Paper, Stack, Typography } from '@mui/material';

import { ceMatchRuleOwnerLevelConfigs } from '../ceMatchRuleOwnerLevelConfig';
import RuleCountSummary from './RuleCountSummary';
import useDebouncedState from '@/hooks/useDebouncedState';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import {
  CeMatchRuleOrganizationFieldsFragment,
  GetCeMatchRuleOrganizationsDocument,
  GetCeMatchRuleOrganizationsQuery,
  GetCeMatchRuleOrganizationsQueryVariables,
} from '@/types/gqlTypes';

const ORGANIZATION_COLUMNS: DataColumnDef<
  CeMatchRuleOrganizationFieldsFragment,
  GetCeMatchRuleOrganizationsQueryVariables
>[] = [
  {
    header: 'Organization',
    key: 'organizationName',
    render: 'organizationName',
  },
  {
    header: 'Effective Rules',
    key: 'effectiveCeMatchRuleCount',
    render: (organization) => {
      const inheritedCount =
        organization.effectiveCeMatchRuleCount -
        organization.localCeMatchRuleCount;

      return (
        <RuleCountSummary
          total={organization.effectiveCeMatchRuleCount}
          localCount={organization.localCeMatchRuleCount}
          inheritedCount={inheritedCount}
        />
      );
    },
  },
  {
    header: 'Unit Groups',
    key: 'unitGroupCount',
    render: 'ceWaitlistUnitGroupCount',
  },
];

/**
 * Shows the Organization owner-level tab where users choose an organization.
 */
const CeMatchOrganizationRules: React.FC = () => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

  return (
    <Stack gap={2}>
      <Stack gap={1}>
        <Typography variant='h4' component='h2'>
          Organization Rules
        </Typography>
        <Typography variant='body2'>
          Select an Organization to review effective rules and manage
          Organization-specific rules.
        </Typography>
      </Stack>
      <CommonSearchInput
        label='Search Organizations'
        name='search organizations'
        placeholder='Search by organization name'
        value={search}
        onChange={setSearch}
        fullWidth
        size='small'
        searchAdornment
        clearAdornment
        helperText='Only organizations with projects that have waitlist referrals enabled will appear.'
      />
      <Paper>
        <GenericTableWithData<
          GetCeMatchRuleOrganizationsQuery,
          GetCeMatchRuleOrganizationsQueryVariables,
          CeMatchRuleOrganizationFieldsFragment
        >
          queryDocument={GetCeMatchRuleOrganizationsDocument}
          columns={ORGANIZATION_COLUMNS}
          rowLinkTo={(organization) =>
            ceMatchRuleOwnerLevelConfigs.organization.getRulesPath({
              ownerId: organization.id,
            })
          }
          rowName={(organization) => organization.organizationName}
          rowActionTitle='View Organization Rules'
          noData='No organizations with waitlist referrals enabled'
          pagePath='organizations'
          recordType='Organization'
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

export default CeMatchOrganizationRules;
