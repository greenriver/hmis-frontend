import { TableCell, TableRow } from '@mui/material';
import React, { useState } from 'react';
import FormRule from '@/modules/admin/components/formRules/FormRule';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import {
  FormRole,
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
import { evictQuery } from '@/utils/cacheUtil';

type RowType = FormRuleFieldsFragment;

interface Props {
  formId: string;
  formRole: FormRole;
}

const FormRuleTable: React.FC<Props> = ({ formId, formRole }) => {
  // Currently selected rule for editing
  const [selectedRule, setSelectedRule] = useState<RowType | undefined>();

  // Form dialog for editing rules
  const { openFormDialog, renderFormDialog } = useStaticFormDialog<
    UpdateFormRuleMutation,
    MutationUpdateFormRuleArgs
  >({
    formRole: StaticFormRole.FormRule,
    initialValues: {
      ...selectedRule,
      // hack: pass service type ids as initial values. We should resolve these on FormRule instead
      serviceTypeId: selectedRule?.serviceType?.id,
      serviceCategoryId: selectedRule?.serviceCategory?.id,
    },
    mutationDocument: UpdateFormRuleDocument,
    localConstants: { formRole },
    getErrors: (data) => data.updateFormRule?.errors || [],
    getVariables: (values) => ({
      input: { input: values as FormRuleInput, id: selectedRule?.id || '' },
    }),
    onCompleted: () => {
      evictQuery('formDefinition', { id: formId });
    },
    onClose: () => setSelectedRule(undefined),
  });

  return (
    <>
      <GenericTableWithData<
        GetFormRulesQuery,
        GetFormRulesQueryVariables,
        RowType
      >
        queryVariables={{ filters: { definition: formId } }}
        queryDocument={GetFormRulesDocument}
        columns={[]}
        pagePath='formRules'
        noData='No form rules'
        recordType='FormRule'
        paginationItemName='rule'
        noSort
        defaultPageSize={100} // Forms aren't expected to have 100s of rules, pagination is unlikely to show up
        renderRow={(rule) => (
          <TableRow key={rule.id}>
            <TableCell sx={{ py: 1 }}>
              <FormRule
                rule={rule}
                setSelectedRule={setSelectedRule}
                openFormDialog={openFormDialog}
              />
            </TableCell>
          </TableRow>
        )}
      />
      {renderFormDialog({
        title: 'Edit Rule',
        DialogProps: { maxWidth: 'sm' },
      })}
    </>
  );
};
export default FormRuleTable;
