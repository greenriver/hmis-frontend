import { Chip } from '@mui/material';
import { Stack } from '@mui/system';
import { omit } from 'lodash-es';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { HmisEnums } from '@/types/gqlEnums';
import {
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

const columns: ColumnDef<FormRuleFieldsFragment>[] = [
  {
    header: 'Rule ID',
    render: 'id',
  },
  {
    header: 'Form Title',
    render: 'definitionTitle',
  },
  {
    header: 'Form Type',
    render: ({ definitionRole }) =>
      definitionRole && HmisEnums.FormRole[definitionRole],
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
        'Any Project Type'
      ),
  },
  {
    // TODO: other funder
    header: 'Funder',
    render: ({ funder }) =>
      funder ? HmisEnums.FundingSource[funder] : 'Any Funder',
  },
  {
    // TODO: readable labels
    header: 'Data Collected About',
    render: ({ dataCollectedAbout }) =>
      dataCollectedAbout
        ? HmisEnums.DataCollectedAbout[dataCollectedAbout]
        : '-',
  },
  // TODO: direct project applicability
  // TODO: direct organization applicability
  // {
  //   header: 'Service Applicability',
  //   render: ({ serviceType, serviceCategory }) => {
  //     if (serviceCategory) return serviceCategory.name;
  //     if (serviceType) return `${serviceType.category}: ${serviceType.name}`;
  //     return 'N/A';
  //   },
  // },
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
        columns={columns}
        pagePath='formRules'
        noData='No form rules'
        showFilters
        recordType='FormRule'
        filterInputType='FormRuleFilterOptions'
        filters={(filters) => omit(filters, 'forServices', 'serviceCategory')}

        // defaultFilters={{ activeStatus: true, systemForm: false }}
      />
    </>
  );
};
export default FormRuleTable;
