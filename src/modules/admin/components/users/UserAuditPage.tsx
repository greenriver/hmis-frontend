import { Paper } from '@mui/material';
import React from 'react';
import UserAccessHistoryTable from './UserAccessHistoryTable';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useGetUserQuery } from '@/types/gqlTypes';

const UserAuditPage: React.FC = () => {
  const { userId } = useSafeParams() as { userId: string };

  const { data, loading, error } = useGetUserQuery({
    variables: { id: userId },
  });

  if (!data && loading) return <Loading />;
  if (error) throw error;
  if (!loading && (!data || !data.user)) return <NotFound />;

  // TODO: support toggling between Access History and Edit History
  return (
    <>
      <PageTitle title={`Access History for ${data?.user?.name}`} />
      <Paper>
        <UserAccessHistoryTable userId={userId} />
      </Paper>
    </>
  );
};

export default UserAuditPage;
