import { Chip } from '@mui/material';
import { startCase } from 'lodash-es';
import React, { useMemo } from 'react';
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

interface Props {
  queryVariables: GetFormIdentifiersQueryVariables;
}
const FormDefinitionTable: React.FC<Props> = ({ queryVariables }) => {
  const columns: ColumnDef<Row>[] = useMemo(
    () => [
      {
        header: 'Form Title',
        render: ({ displayVersion }) => displayVersion.title,
      },
      {
        header: 'Form Type',
        render: ({ displayVersion }) => (
          <FormTypeChip role={displayVersion.role} />
        ),
      },
      {
        key: 'status',
        header: 'Form Status',
        // Raw status of the "display version", not the full explanatory status from FormStatus component.
        // This will be "Published" if there is ANY published version (even if there's  also a draft in progress)
        render: (identifier) => startCase(identifier.displayVersion.status),
      },
      {
        header: 'Applicability Rules',
        render: ({ displayVersion }) => displayVersion.formRules.nodesCount,
      },

      {
        key: 'system',
        header: 'Form Tags',
        render: ({ managedInVersionControl }) =>
          managedInVersionControl && (
            <Chip
              // User-facing language is "System Form" instead of "managed in version control" to be more user friendly.
              // There is an explanation on the form detail page.
              label='System Form'
              size='small'
              variant='outlined'
              sx={{ width: 'fit-content', px: 1 }}
            />
          ),
      },
    ],
    []
  );

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
