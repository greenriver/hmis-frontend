import { ListItem, ListItemText, Paper, Stack } from '@mui/material';
import pluralize from 'pluralize';
import React from 'react';
import {
  ContextualCollapsibleList,
  ContextualCollapsibleListsProvider,
  ContextualListExpansionButton,
} from '@/components/elements/CollapsibleListContext';
import Loading from '@/components/elements/Loading';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import {
  GetUserAccessHistoryDocument,
  GetUserAccessHistoryQuery,
  GetUserAccessHistoryQueryVariables,
  UserActivityLogFieldsFragment,
  useGetUserQuery,
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

const UserAccessHistory: React.FC = () => {
  const { userId } = useSafeParams() as { userId: string };

  const { data, loading, error } = useGetUserQuery({
    variables: { id: userId },
  });

  if (!data && loading) return <Loading />;
  if (error) throw error;
  if (!loading && (!data || !data.user)) return <NotFound />;

  return (
    <ContextualCollapsibleListsProvider>
      <PageTitle title={`Access History for ${data?.user?.name}`} />
      <Paper>
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
      </Paper>
    </ContextualCollapsibleListsProvider>
  );
};

export default UserAccessHistory;
