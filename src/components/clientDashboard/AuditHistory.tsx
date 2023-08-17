import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Paper, Stack, Tooltip, Typography } from '@mui/material';
import { capitalize, filter, isNil } from 'lodash-es';

import SimpleTable from '../elements/SimpleTable';

import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
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
  <Typography component='span' variant='inherit' color='text.disabled'>
    Empty
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
    header: 'Timestamp',
    width: '1%',
    render: (e) =>
      e.createdAt && formatDateTimeForDisplay(new Date(e.createdAt)),
  },
  {
    header: 'User',
    width: '1%',
    render: (e) => e.user?.name,
  },
  {
    header: 'Action',
    width: '10%',
    render: (e) => {
      const action = `${capitalize(e.event)} ${e.recordName}`;
      if (e.recordName === 'Client') return action;
      return (
        <Stack>
          <Typography variant='inherit'>{action}</Typography>
          <Typography
            color='text.secondary'
            variant='inherit'
          >{`ID: ${e.recordId}`}</Typography>
        </Stack>
      );
    },
  },
  {
    header: 'Fields Changed',
    render: (e) => {
      return (
        <SimpleTable
          TableCellProps={{
            sx: {
              pl: 0,
              py: 2,
              borderColor: (theme) => theme.palette.grey[200],
            },
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
          rows={Object.values(e.objectChanges as ChangesType)
            .filter((r) => filter(r.values, hasMeaningfulValue).length > 0)
            .map((r) => ({
              ...r,
              id: r.fieldName,
            }))}
          columns={[
            { name: 'field', render: (row) => <b>{row.displayName}</b> },
            {
              name: 'changes',
              render: ({ values, fieldName }) => {
                if (values === 'changed') return changedText;

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
                  <Stack gap={1} direction='row'>
                    <Typography variant='body2'>
                      {isNil(from) ? nullText : from}
                    </Typography>
                    <Typography variant='body2'>&rarr;</Typography>
                    <Typography variant='body2'>
                      {isNil(to) ? nullText : to}
                    </Typography>
                  </Stack>
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
        <Typography variant='h4'>Client Audit History</Typography>
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
          noData='No audit history'
          rowSx={() => ({ whiteSpace: 'nowrap' })}
        />
      </Paper>
    </>
  );
};

export default AuditHistory;
