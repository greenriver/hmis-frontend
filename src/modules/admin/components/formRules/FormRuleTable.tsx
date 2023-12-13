import { Chip } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useState } from 'react';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { HmisEnums } from '@/types/gqlEnums';

import {
  FormRuleFieldsFragment,
  FormRuleInput,
  GetFormRulesDocument,
  GetFormRulesQuery,
  GetFormRulesQueryVariables,
  MutationUpdateFormRuleArgs,
  StaticFormRole,
  UpdateFormRuleDocument,
  UpdateFormRuleMutation,
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

type RowType = FormRuleFieldsFragment;
const FORM_RULE_COLUMNS: ColumnDef<RowType>[] = [
  {
    header: 'Rule ID',
    render: 'id',
    linkTreatment: true,
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
      dataCollectedAbout ? (
        HmisEnums.DataCollectedAbout[dataCollectedAbout]
      ) : (
        <NotCollectedText>Not Specified</NotCollectedText>
      ),
  },
  // TODO: direct project applicability
  // TODO: direct organization applicability
];

interface Props {
  queryVariables?: GetFormRulesQueryVariables;
}

const FormRuleTable: React.FC<Props> = ({ queryVariables }) => {
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

  return (
    <>
      <GenericTableWithData<
        GetFormRulesQuery,
        GetFormRulesQueryVariables,
        RowType
      >
        queryVariables={queryVariables || {}}
        queryDocument={GetFormRulesDocument}
        columns={FORM_RULE_COLUMNS}
        pagePath='formRules'
        noData='No form rules'
        showFilters
        recordType='FormRule'
        filterInputType='FormRuleFilterOptions'
        paginationItemName='rule'
        handleRowClick={(row) => {
          setSelectedRule(row);
          openFormDialog();
        }}
      />
      {renderFormDialog({
        title: 'Edit Rule',
        DialogProps: { maxWidth: 'sm' },
      })}
    </>
  );
};
export default FormRuleTable;
