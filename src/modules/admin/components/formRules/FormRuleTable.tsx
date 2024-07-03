import { TableCell, TableRow } from '@mui/material';
import React from 'react';
import FormRule from '@/modules/admin/components/formRules/FormRule';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  ActiveStatus,
  FormRole,
  FormRuleFieldsFragment,
  GetFormRulesDocument,
  GetFormRulesQuery,
  GetFormRulesQueryVariables,
} from '@/types/gqlTypes';

type RowType = FormRuleFieldsFragment;

interface Props {
  formId: string;
  formRole: FormRole;
  formCacheKey: string;
}

const FormRuleTable: React.FC<Props> = ({ formId, formRole, formCacheKey }) => {
  return (
    <>
      <GenericTableWithData<
        GetFormRulesQuery,
        GetFormRulesQueryVariables,
        RowType
      >
        queryVariables={{ filters: { definition: formId } }}
        defaultFilterValues={{ activeStatus: ActiveStatus.Active }}
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
                formRole={formRole}
                formCacheKey={formCacheKey}
              />
            </TableCell>
          </TableRow>
        )}
      />
    </>
  );
};
export default FormRuleTable;
