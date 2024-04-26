import { Chip } from '@mui/material';
import React from 'react';
import { generatePath } from 'react-router-dom';
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
    render: ({ system }) =>
      system && (
        <Chip
          label='System'
          size='small'
          variant='outlined'
          sx={{ width: 'fit-content' }}
        />
      ),
  },
  // TODO ADD: # projects active in (based on all rules)
  // TODO ADD: version
  // TODO ADD: status
  // TODO ADD: last updated
];

interface Props {
  queryVariables: GetFormDefinitionsQueryVariables;
}
const FormDefinitionTable: React.FC<Props> = ({ queryVariables }) => {
  return (
    <GenericTableWithData<
      GetFormDefinitionsQuery,
      GetFormDefinitionsQueryVariables,
      Row
    >
      queryVariables={queryVariables}
      queryDocument={GetFormDefinitionsDocument}
      columns={columns}
      pagePath='formDefinitions'
      recordType='FormDefinition'
      // TODO: add filter/sort capabilities
      paginationItemName='form'
      rowLinkTo={(row) =>
        generatePath(AdminDashboardRoutes.VIEW_FORM, { formId: row.id })
      }
    />
  );
};
export default FormDefinitionTable;
