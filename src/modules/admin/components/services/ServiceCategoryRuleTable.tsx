import { Button } from '@mui/material';
import { omit } from 'lodash-es';
import { useMemo, useState } from 'react';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DataCollectedAbout,
  FormRuleFieldsFragment,
  FormRuleInput,
  GetServiceCategoryRulesDocument,
  GetServiceCategoryRulesQuery,
  GetServiceCategoryRulesQueryVariables,
  MutationUpdateFormRuleArgs,
  StaticFormRole,
  UpdateFormRuleDocument,
  UpdateFormRuleMutation,
} from '@/types/gqlTypes';

interface Props {
  serviceCategoryId: string;
}

type RowType = FormRuleFieldsFragment;

const FORM_RULE_COLUMNS: ColumnDef<RowType>[] = [
  {
    header: 'Rule ID',
    render: 'id',
  },
  {
    header: 'Form Title',
    render: 'definitionTitle',
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
    header: 'Status',
    render: ({ active }) => (active ? 'Active' : 'Inactive'),
  },
];

const ServiceCategoryRuleTable: React.FC<Props> = ({ serviceCategoryId }) => {
  // Currently selected rule for editing
  const [selectedRule, setSelectedRule] = useState<RowType | undefined>();

  // Form dialog for editing rules
  const { openFormDialog, renderFormDialog } = useStaticFormDialog<
    UpdateFormRuleMutation,
    MutationUpdateFormRuleArgs
  >({
    formRole: StaticFormRole.FormRule,
    initialValues: selectedRule,
    mutationDocument: UpdateFormRuleDocument,
    getErrors: (data) => data.updateFormRule?.errors || [],
    getVariables: (values) => ({
      input: { input: values as FormRuleInput, id: selectedRule?.id || '' },
    }),
    onCompleted: () => {},
    onClose: () => setSelectedRule(undefined),
  });

  const columnsWithAction: typeof FORM_RULE_COLUMNS = useMemo(() => {
    return [
      ...FORM_RULE_COLUMNS,
      {
        key: 'action',
        textAlign: 'right',
        render: (row) => {
          // system rules cannot be changed
          if (row.system) return null;

          return (
            <Button
              onClick={() => {
                setSelectedRule(row);
                openFormDialog();
              }}
              size='small'
              variant='outlined'
            >
              Edit
            </Button>
          );
        },
      },
    ];
  }, [openFormDialog]);

  return (
    <>
      <GenericTableWithData<
        GetServiceCategoryRulesQuery,
        GetServiceCategoryRulesQueryVariables,
        FormRuleFieldsFragment
      >
        queryVariables={{ id: serviceCategoryId }}
        queryDocument={GetServiceCategoryRulesDocument}
        columns={columnsWithAction}
        pagePath='serviceCategory.formRules'
        noData='No form rules'
        showFilters
        recordType='FormRule'
        filterInputType='FormRuleFilterOptions'
        paginationItemName='rule'
        filters={(filters) => omit(filters, 'formType')}
      />
      {renderFormDialog({
        title: 'Edit Rule',
        DialogProps: { maxWidth: 'sm' },
      })}
    </>
  );
};

export default ServiceCategoryRuleTable;
