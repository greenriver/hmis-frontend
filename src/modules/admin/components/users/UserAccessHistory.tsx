import { ListItem, ListItemText, Paper } from '@mui/material';
import pluralize from 'pluralize';
import React from 'react';
import CollapsibleList from '@/components/elements/CollapsibleList';
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
    header: 'Records Accessed',
    tableCellProps: {
      sx: { p: 0, backgroundColor: (theme) => theme.palette.grey[100] },
    },
    render: ({ resolvedRecords }) => {
      return (
        <CollapsibleList
          title={pluralize('record', resolvedRecords.length, true)}
        >
          {resolvedRecords.map(({ recordType, recordId }, idx) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <ListItem key={idx}>
                <ListItemText primary={`${recordType} ${recordId}`} />
              </ListItem>
            );
          })}
        </CollapsibleList>
      );
    },
  },
];
const UserAccessHistory: React.FC = () => {
  const { userId } = useSafeParams() as { userId: string };

  const { data, loading, error } = useGetUserQuery({
    variables: { id: userId },
  });

  if (!data && loading) {
    return <Loading />;
  }
  if (error) throw error;
  if (!loading && (!data || !data.user)) return <NotFound />;

  return (
    <>
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
    </>
  );
};

export default UserAccessHistory;
