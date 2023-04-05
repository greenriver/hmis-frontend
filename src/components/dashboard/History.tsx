import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Paper, Stack, Tooltip, Typography } from '@mui/material';
import { isNil } from 'lodash-es';

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
  <Typography
    component='span'
    variant='inherit'
    sx={(theme) => ({ color: theme.palette.text.disabled })}
  >
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
    render: (e) =>
      e.createdAt && formatDateTimeForDisplay(new Date(e.createdAt)),
  },
  {
    header: 'User',
    render: (e) => e.user?.name,
  },
  {
    header: 'Action',
    render: (e) => e.event,
  },
  {
    header: 'changes',
    render: (e) => {
      return Object.entries(e.objectChanges as ChangesType).map(
        ([key, { fieldName, displayName, values = [] }]) => {
          if (values === 'changed')
            return (
              <Typography variant='body2'>
                {displayName}: {changedText}
              </Typography>
            );

          const [from, to] = values.map((val) =>
            isNil(val) ? null : (
              <HmisField
                key={key}
                record={{ ...e.objectChanges, [fieldName]: val }}
                fieldName={fieldName}
                recordType='Client'
              />
            )
          );
          return (
            <Typography variant='body2' display='flex' gap={0.5}>
              {displayName}: {from || nullText} &rarr; {to || nullText}
            </Typography>
          );
        }
      );
    },
  },
];

const History = () => {
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

export default History;
