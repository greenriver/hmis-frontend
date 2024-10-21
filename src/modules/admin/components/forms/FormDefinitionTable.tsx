import { Chip, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import React, { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import FormTypeChip from './FormTypeChip';
import ButtonLink from '@/components/elements/ButtonLink';
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
        width: '300px',
      },
      {
        header: 'Form Type',
        render: ({ displayVersion }) => (
          <FormTypeChip role={displayVersion.role} />
        ),
      },
      {
        header: 'Applicability Rules',
        render: ({ displayVersion }) => displayVersion.formRules.nodesCount,
      },
      {
        key: 'system',
        render: ({ managedInVersionControl }) =>
          managedInVersionControl && (
            <Chip
              label='System'
              size='small'
              variant='outlined'
              sx={{ width: 'fit-content' }}
            />
          ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (identifier) => (
          <Typography variant='body2'>
            {startCase(identifier.displayVersion.status)}
          </Typography>
        ),
      },
      {
        key: 'action',
        textAlign: 'right',
        render: ({ identifier }) => (
          <ButtonLink
            variant='outlined'
            size='small'
            to={generatePath(AdminDashboardRoutes.VIEW_FORM, {
              identifier,
            })}
          >
            View Form
          </ButtonLink>
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
    />
  );
};
export default FormDefinitionTable;
