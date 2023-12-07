import { Chip } from '@mui/material';
import { Stack } from '@mui/system';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DataCollectedAbout,
  FormRuleFieldsFragment,
  GetFormRulesDocument,
  GetFormRulesQuery,
  GetFormRulesQueryVariables,
} from '@/types/gqlTypes';

const SystemChip = () => (
  <Chip
    label='System'
    size='small'
    color='success'
    variant='outlined'
    sx={{ width: 'fit-content' }}
  />
);

const FORM_RULE_COLUMNS: ColumnDef<FormRuleFieldsFragment>[] = [
  {
    header: 'Rule ID',
    render: 'id',
  },
  {
    header: 'Form Type',
    render: ({ definitionRole }) =>
      definitionRole && HmisEnums.FormRole[definitionRole],
  },
  {
    header: 'Form Title',
    render: 'definitionTitle',
  },
  {
    header: 'Active Status',
    render: ({ system, active }) => (
      <Stack direction={'row'} gap={1}>
        {active ? 'Active' : 'Inactive'}
        {system && <SystemChip />}
      </Stack>
    ),
  },
  {
    header: 'Project Applicability',
    render: ({ projectType }) =>
      projectType ? (
        <ProjectTypeChip projectType={projectType} />
      ) : (
        <NotCollectedText>All Project Types</NotCollectedText>
      ),
  },
  {
    header: 'Funder',
    render: ({ funder, otherFunder }) => {
      if (funder) return HmisEnums.FundingSource[funder];
      if (otherFunder) return otherFunder;
      return <NotCollectedText>All Funders</NotCollectedText>;
    },
  },
  {
    header: 'Data Collected About',
    render: ({ dataCollectedAbout }) =>
      dataCollectedAbout
        ? HmisEnums.DataCollectedAbout[dataCollectedAbout]
        : HmisEnums.DataCollectedAbout[DataCollectedAbout.AllClients],
  },
  // TODO: direct project applicability
  // TODO: direct organization applicability
];

const FormRuleTable = () => {
  return (
    <>
      <GenericTableWithData<
        GetFormRulesQuery,
        GetFormRulesQueryVariables,
        FormRuleFieldsFragment
      >
        queryVariables={{}}
        queryDocument={GetFormRulesDocument}
        columns={FORM_RULE_COLUMNS}
        pagePath='formRules'
        noData='No form rules'
        showFilters
        recordType='FormRule'
        filterInputType='FormRuleFilterOptions'
        paginationItemName='rule'
        // defaultFilters={{
        //   activeStatus: [ActiveStatus.Active],
        //   systemForm: [SystemStatus.NonSystem],
        // }}
      />
    </>
  );
};
export default FormRuleTable;
