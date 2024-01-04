import { Button } from '@mui/material';
import React from 'react';
import { generatePath } from 'react-router-dom';
import { SystemChip } from '../formRules/FormRuleTable';
import FormTypeChip from './FormTypeChip';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GetFormDefinitionsDocument,
  GetFormDefinitionsQuery,
  GetFormDefinitionsQueryVariables,
} from '@/types/gqlTypes';

export type Row = NonNullable<
  GetFormDefinitionsQuery['formDefinitions']
>['nodes'][0];

const columns: ColumnDef<Row>[] = [
  {
    header: 'Form Title',
    render: 'title',
    width: '300px',
    linkTreatment: true,
  },
  {
    header: 'Form Type',
    render: ({ role }) => <FormTypeChip role={role} />,
  },
  {
    header: 'Applicability Rules',
    render: ({ formRules }) => formRules.nodesCount,
  },
  {
    key: 'system',
    render: ({ system }) => system && <SystemChip />,
  },
  // TODO ADD: # projects active in (based on all rules)
  // TODO ADD: version
  // TODO ADD: status
  // TODO ADD: last updated
];

const FormDefinitionTable: React.FC<{ onSelect?: (row: Row) => any }> = ({
  onSelect,
}) => {
  return (
    <GenericTableWithData<
      GetFormDefinitionsQuery,
      GetFormDefinitionsQueryVariables,
      Row
    >
      queryVariables={{}}
      queryDocument={GetFormDefinitionsDocument}
      columns={[
        ...columns,
        ...(onSelect
          ? ([
              {
                key: 'actions',
                textAlign: 'right',
                render: (row) => {
                  return (
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect(row);
                      }}
                      size='small'
                      variant='outlined'
                    >
                      Edit
                    </Button>
                  );
                },
              },
            ] as ColumnDef<Row>[])
          : []),
      ]}
      pagePath='formDefinitions'
      showFilters
      recordType='FormDefinition'
      // TODO: add filter/sort capabilities
      // filterInputType='FormDefinitionFilterOptions'
      paginationItemName='form'
      rowLinkTo={(row) =>
        generatePath(AdminDashboardRoutes.VIEW_FORM, { formId: row.id })
      }
    />
  );
};
export default FormDefinitionTable;