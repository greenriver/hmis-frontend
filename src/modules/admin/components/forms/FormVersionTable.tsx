import { Typography } from '@mui/material';
import { capitalize } from 'lodash-es';
import React from 'react';
import { generatePath } from 'react-router-dom';
import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';

import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  FormStatus,
  GetFormIdentifierVersionsDocument,
  GetFormIdentifierVersionsQuery,
  GetFormIdentifierVersionsQueryVariables,
} from '@/types/gqlTypes';

type RowType = NonNullable<
  GetFormIdentifierVersionsQuery['formIdentifier']
>['allVersions']['nodes'][0];

interface Props {
  formIdentifier: string;
}

const VersionSummary: React.FC<{ row: RowType }> = ({ row }) => {
  const verb = capitalize(row.status);
  const text = row.status === FormStatus.Draft ? 'last updated on' : 'on';
  const timestamp = parseAndFormatDateTime(row.dateUpdated);
  const byUser = row.updatedBy ? ` by ${row.updatedBy.name}` : '';
  return (
    <Typography variant='body2'>
      {`V${row.version} `}
      <RouterLink
        to={generatePath(AdminDashboardRoutes.PREVIEW_FORM, {
          identifier: row.identifier,
          formId: row.id,
        })}
      >
        {verb}
      </RouterLink>
      {` ${text} ${timestamp}${byUser}`}
    </Typography>
  );
};

const columns: ColumnDef<RowType>[] = [
  {
    key: 'version',
    render: (row) => <VersionSummary row={row} />,
  },
];

const FormVersionTable: React.FC<Props> = ({ formIdentifier }) => {
  return (
    <>
      <GenericTableWithData<
        GetFormIdentifierVersionsQuery,
        GetFormIdentifierVersionsQueryVariables,
        RowType
      >
        queryVariables={{ identifier: formIdentifier }}
        queryDocument={GetFormIdentifierVersionsDocument}
        columns={columns}
        pagePath='formIdentifier.allVersions'
        noData='No versions'
        recordType='FormDefinotion'
        paginationItemName='version'
        defaultPageSize={5}
        rowSx={() => ({ td: { p: 2.5 } })}
      />
    </>
  );
};
export default FormVersionTable;
