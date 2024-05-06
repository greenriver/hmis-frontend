import { Chip } from '@mui/material';
import React from 'react';
import { generatePath } from 'react-router-dom';
import FormTypeChip from './FormTypeChip';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GetFormIdentifiersDocument,
  GetFormIdentifiersQuery,
  GetFormIdentifiersQueryVariables,
} from '@/types/gqlTypes';

export type Row = NonNullable<
  GetFormIdentifiersQuery['formIdentifiers']
>['nodes'][0];

const columns: ColumnDef<Row>[] = [
  {
    header: 'Form Title',
    render: ({ displayVersion }) => displayVersion.title,
    width: '300px',
    linkTreatment: true,
  },
  {
    header: 'Form Type',
    render: ({ displayVersion }) => <FormTypeChip role={displayVersion.role} />,
  },
  {
    header: 'Applicability Rules',
    render: ({ displayVersion }) => displayVersion.formRules.nodesCount,
  },
  {
    key: 'system',
    render: ({ displayVersion }) =>
      displayVersion.system && (
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
  queryVariables: GetFormIdentifiersQueryVariables;
}
const FormDefinitionTable: React.FC<Props> = ({ queryVariables }) => {
  return (
    <GenericTableWithData<
      GetFormIdentifiersQuery,
      GetFormIdentifiersQueryVariables,
      Row
    >
      queryVariables={queryVariables}
      queryDocument={GetFormIdentifiersDocument}
      columns={columns}
      pagePath='formIdentifiers'
      recordType='FormIdentifier'
      // TODO: add filter/sort capabilities
      paginationItemName='form'
      rowLinkTo={(row) =>
        generatePath(AdminDashboardRoutes.VIEW_FORM, {
          identifier: row.identifier,
        })
      }
    />
  );
};
export default FormDefinitionTable;
