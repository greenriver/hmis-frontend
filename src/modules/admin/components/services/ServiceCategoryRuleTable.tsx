import { Button } from '@mui/material';
import { omit } from 'lodash-es';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DataCollectedAbout,
  FormRuleFieldsFragment,
  GetServiceCategoryRulesDocument,
  GetServiceCategoryRulesQuery,
  GetServiceCategoryRulesQueryVariables,
} from '@/types/gqlTypes';

interface Props {
  serviceCategoryId: string;
}

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
    header: 'Status',
    render: ({ active }) => (active ? 'Active' : 'Inactive'),
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
  {
    key: 'actions',
    textAlign: 'right',
    render: () => (
      <Button variant='outlined' size='small'>
        Edit
      </Button>
    ),
  },
];

const ServiceCategoryRuleTable: React.FC<Props> = ({ serviceCategoryId }) => {
  return (
    <>
      <GenericTableWithData<
        GetServiceCategoryRulesQuery,
        GetServiceCategoryRulesQueryVariables,
        FormRuleFieldsFragment
      >
        queryVariables={{ id: serviceCategoryId }}
        queryDocument={GetServiceCategoryRulesDocument}
        columns={columns}
        pagePath='serviceCategory.formRules'
        noData='No form rules'
        showFilters
        recordType='FormRule'
        filterInputType='FormRuleFilterOptions'
        paginationItemName='rule'
        filters={(filters) => omit(filters, 'formType')}
      />
    </>
  );
};

export default ServiceCategoryRuleTable;
