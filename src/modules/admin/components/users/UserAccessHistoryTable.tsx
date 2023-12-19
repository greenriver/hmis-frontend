import { ListItem, ListItemText, Stack } from '@mui/material';
import pluralize from 'pluralize';
import React from 'react';
import {
  ContextualCollapsibleList,
  ContextualCollapsibleListsProvider,
  ContextualListExpansionButton,
} from '@/components/elements/CollapsibleListContext';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import {
  GetUserAccessHistoryDocument,
  GetUserAccessHistoryQuery,
  GetUserAccessHistoryQueryVariables,
  UserActivityLogFieldsFragment,
} from '@/types/gqlTypes';

const columns: ColumnDef<UserActivityLogFieldsFragment>[] = [
  {
    header: 'Date Accessed',
    render: ({ createdAt }) => parseAndFormatDateTime(createdAt),
  },
  {
    header: 'IP Address',
    render: 'ipAddress',
  },
  {
    header: (
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <strong>Records Accessed</strong>
        <ContextualListExpansionButton />
      </Stack>
    ),
    tableCellProps: {
      sx: { p: 0, backgroundColor: (theme) => theme.palette.grey[50] },
    },
    width: '300px',
    render: ({ resolvedRecords }) => (
      <ContextualCollapsibleList
        title={pluralize('record', resolvedRecords.length, true)}
      >
        {resolvedRecords.map(({ recordType, recordId }, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <ListItem key={idx}>
            <ListItemText primary={`${recordType} ${recordId}`} />
          </ListItem>
        ))}
      </ContextualCollapsibleList>
    ),
  },
];

interface Props {
  userId: string;
}
const UserAccessHistoryTable: React.FC<Props> = ({ userId }) => {
  return (
    <ContextualCollapsibleListsProvider>
      <GenericTableWithData<
        GetUserAccessHistoryQuery,
        GetUserAccessHistoryQueryVariables,
        UserActivityLogFieldsFragment
      >
        queryVariables={{ id: userId }}
        queryDocument={GetUserAccessHistoryDocument}
        columns={columns}
        pagePath='user.activityLogs'
        noData='No access history'
      />
    </ContextualCollapsibleListsProvider>
  );
};

export default UserAccessHistoryTable;
