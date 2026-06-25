import { Paper, Stack, Typography } from '@mui/material';

import { ceMatchRuleOwnerLevelConfigs } from '../../ceMatchRuleOwnerLevelConfig';
import RuleCountSummary from '../RuleCountSummary';
import useDebouncedState from '@/hooks/useDebouncedState';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import {
  CeMatchRuleProjectFieldsFragment,
  GetCeMatchRuleProjectsDocument,
  GetCeMatchRuleProjectsQuery,
  GetCeMatchRuleProjectsQueryVariables,
} from '@/types/gqlTypes';

const PROJECT_COLUMNS: DataColumnDef<
  CeMatchRuleProjectFieldsFragment,
  GetCeMatchRuleProjectsQueryVariables
>[] = [
  {
    header: 'Project',
    key: 'projectName',
    render: 'projectName',
  },
  {
    header: 'Effective Rules',
    key: 'effectiveCeMatchRuleCount',
    render: (project) => {
      const inheritedCount =
        project.effectiveCeMatchRuleCount - project.localCeMatchRuleCount;

      return (
        <RuleCountSummary
          total={project.effectiveCeMatchRuleCount}
          localCount={project.localCeMatchRuleCount}
          inheritedCount={inheritedCount}
        />
      );
    },
  },
  {
    header: 'Organization',
    key: 'organizationName',
    render: (project) => project.organization.organizationName,
  },
];

/**
 * Shows the Project owner-level tab where users choose a project.
 */
const CeMatchRuleProjects: React.FC = () => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

  return (
    <Stack gap={2}>
      <Stack gap={1}>
        <Typography variant='h4' component='h2'>
          Project Rules
        </Typography>
        <Typography variant='body2'>
          Select a Project to review effective rules and manage Project-specific
          rules.
        </Typography>
      </Stack>
      <CommonSearchInput
        label='Search Projects'
        name='search projects'
        placeholder='Search by project name'
        value={search}
        onChange={setSearch}
        fullWidth
        size='small'
        searchAdornment
        clearAdornment
        helperText='Only projects with waitlist referrals enabled will appear.'
      />
      <Paper>
        <GenericTableWithData<
          GetCeMatchRuleProjectsQuery,
          GetCeMatchRuleProjectsQueryVariables,
          CeMatchRuleProjectFieldsFragment
        >
          queryDocument={GetCeMatchRuleProjectsDocument}
          columns={PROJECT_COLUMNS}
          rowLinkTo={(project) =>
            ceMatchRuleOwnerLevelConfigs.project.getRulesPath({
              ownerId: project.id,
            })
          }
          rowName={(project) => project.projectName}
          rowActionTitle='View Project Rules'
          noData='No projects with waitlist referrals enabled'
          pagePath='projects'
          recordType='Project'
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

export default CeMatchRuleProjects;
