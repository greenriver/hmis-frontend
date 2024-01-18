import { Button, Chip } from '@mui/material';
import { Stack } from '@mui/system';
import { omit } from 'lodash-es';
import React, { useMemo, useState } from 'react';
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

export const SystemChip = () => (
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
    width: '80px',
  },
  // {
  //   header: 'Form Type',
  //   render: ({ definitionRole }) =>
  //     definitionRole && HmisEnums.FormRole[definitionRole],
  // },
  // {
  //   header: 'Form Title',
  //   render: 'definitionTitle',
  // },
  {
    header: 'Project Type',
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
      if (otherFunder && !funder) return otherFunder;
      if (funder)
        return (
          <Stack>
            <span>{HmisEnums.FundingSource[funder]}</span>
            <span>{otherFunder}</span>
          </Stack>
        );
      return <NotCollectedText>All Funders</NotCollectedText>;
    },
  },
  {
    // Direct Project/Org applicability rule
    header: 'Entity',
    render: ({ project, organization }) => {
      if (project) return project.projectName;
      if (organization) return organization.organizationName;
      return <NotCollectedText>None</NotCollectedText>;
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
  {
    header: 'Status',
    render: ({ system, active }) => (
      <Stack direction={'row'} gap={1}>
        {active ? 'Active' : 'Inactive'}
        {system && <SystemChip />}
      </Stack>
    ),
  },
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
        GetFormRulesQuery,
        GetFormRulesQueryVariables,
        RowType
      >
        queryVariables={queryVariables || {}}
        queryDocument={GetFormRulesDocument}
        columns={columnsWithAction}
        pagePath='formRules'
        noData='No form rules'
        showFilters
        recordType='FormRule'
        filterInputType='FormRuleFilterOptions'
        paginationItemName='rule'
        filters={(filters) => omit(filters, 'definition', 'formType')}
        noSort
        // tableProps={{ sx: { tableLayout: 'fixed' } }}
      />
      {renderFormDialog({
        title: 'Edit Rule',
        DialogProps: { maxWidth: 'sm' },
      })}
    </>
  );
};
export default FormRuleTable;
