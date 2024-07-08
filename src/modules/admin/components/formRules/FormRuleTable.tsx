import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, TableCell, TableRow } from '@mui/material';
import React from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import FormRule from '@/modules/admin/components/formRules/FormRule';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { cache } from '@/providers/apolloClient';
import {
  ActiveStatus,
  FormRole,
  FormRuleFieldsFragment,
  GetFormRulesDocument,
  GetFormRulesQuery,
  GetFormRulesQueryVariables,
  useDeactivateFormRuleMutation,
} from '@/types/gqlTypes';

type RowType = FormRuleFieldsFragment;

interface Props {
  formId: string;
  formRole: FormRole;
  formCacheKey: string;
}

const FormRuleTable: React.FC<Props> = ({ formId, formRole, formCacheKey }) => {
  const [deactivate, { loading, error }] = useDeactivateFormRuleMutation({
    onCompleted: (data) => {
      cache.evict({ id: `FormRule:${data.updateFormRule?.formRule.id}` });
      cache.evict({
        id: `FormDefinition:{"cacheKey":"${formCacheKey}"}`,
        fieldName: 'projectMatches',
      });
    },
  });

  if (error) throw error;

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
                actionButtons={
                  <ButtonTooltipContainer
                    title={rule.system ? 'System rule cannot be removed' : ''}
                  >
                    <IconButton
                      onClick={() => deactivate({ variables: { id: rule.id } })}
                      size='small'
                      sx={{ height: '28px' }}
                      disabled={rule.system || loading}
                    >
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </ButtonTooltipContainer>
                }
              />
            </TableCell>
          </TableRow>
        )}
      />
    </>
  );
};
export default FormRuleTable;
