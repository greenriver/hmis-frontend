import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Paper, Stack, Tooltip, Typography } from '@mui/material';
import { capitalize, isNil } from 'lodash-es';

import SimpleTable from '../elements/SimpleTable';

import { ColumnDef } from '@/components/elements/GenericTable';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisField from '@/modules/hmis/components/HmisField';
import { formatDateTimeForDisplay } from '@/modules/hmis/hmisUtil';
import {
  GetClientAuditEventsDocument,
  GetClientAuditEventsQuery,
  GetClientAuditEventsQueryVariables,
} from '@/types/gqlTypes';

type AssessmentType = NonNullable<
  NonNullable<GetClientAuditEventsQuery['client']>['auditHistory']
>['nodes'][0];

const nullText = (
  <Typography component='span' variant='inherit' color='text.secondary'>
    null
  </Typography>
);
const changedText = (
  <Typography
    component='span'
    variant='inherit'
    display='inline-flex'
    alignItems='center'
  >
    changed&#160;
    <Tooltip title='Value changed but is not viewable'>
      <HelpOutlineIcon fontSize='inherit' />
    </Tooltip>
  </Typography>
);

type ChangesType = {
  [key: string]: {
    fieldName: string;
    displayName: string;
    values: [any, any] | 'changed';
  };
};

const columns: ColumnDef<AssessmentType>[] = [
  {
    header: 'Date',
    width: '20%',
    render: (e) =>
      e.createdAt && formatDateTimeForDisplay(new Date(e.createdAt)),
  },
  {
    header: 'User',
    width: '15%',
    render: (e) => e.user?.name,
  },
  {
    header: 'Action',
    width: '10%',
    render: (e) => capitalize(e.event),
  },
  {
    header: 'Changes',
    render: (e) => {
      return (
        <SimpleTable
          TableCellProps={{
            sx: { py: 0.5, borderColor: (theme) => theme.palette.grey[200] },
          }}
          TableBodyProps={{
            sx: {
              '.MuiTableRow-root:last-child .MuiTableCell-root': {
                border: 'none',
              },
            },
          }}
          TableRowProps={{
            sx: { '.MuiTableCell-root:first-child': { width: '180px' } },
          }}
          rows={Object.values(e.objectChanges as ChangesType).map((r) => ({
            ...r,
            id: r.fieldName,
          }))}
          columns={[
            { name: 'field', render: (row) => row.displayName },
            {
              name: 'changes',
              render: ({ values, fieldName, displayName }) => {
                if (values === 'changed')
                  return (
                    <Typography variant='body2'>
                      {displayName}: {changedText}
                    </Typography>
                  );

                const [from, to] = values.map((val) =>
                  isNil(val) ? null : (
                    <HmisField
                      key={fieldName}
                      record={{ ...e.objectChanges, [fieldName]: val }}
                      fieldName={fieldName}
                      recordType='Client'
                    />
                  )
                );
                return (
                  <Typography variant='body2' display='flex' gap={0.5}>
                    {from || nullText} &rarr; {to || nullText}
                  </Typography>
                );
              },
            },
          ]}
        />
      );
    },
  },
];

const AuditHistory = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  return (
    <>
      <Stack
        gap={3}
        direction='row'
        justifyContent={'space-between'}
        sx={{ mb: 2, pr: 1, alignItems: 'center' }}
      >
        <Typography variant='h4'>Audit History</Typography>
      </Stack>
      <Paper>
        <GenericTableWithData<
          GetClientAuditEventsQuery,
          GetClientAuditEventsQueryVariables,
          AssessmentType
        >
          queryVariables={{ id: clientId }}
          queryDocument={GetClientAuditEventsDocument}
          columns={columns}
          pagePath='client.auditHistory'
          fetchPolicy='cache-and-network'
          noData='No audit history.'
        />
      </Paper>
    </>
  );
};

export default AuditHistory;
