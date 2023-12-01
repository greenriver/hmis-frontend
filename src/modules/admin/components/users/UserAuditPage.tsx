import { Paper } from '@mui/material';
import React from 'react';
import UserAccessHistoryTable from './UserAccessHistoryTable';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useUser } from '@/modules/dataFetching/hooks/useUser';

const UserAuditPage: React.FC = () => {
  const { userId } = useSafeParams() as { userId: string };
  const { user, loading } = useUser(userId);

  if (!user && loading) return <Loading />;
  if (!user) return <NotFound />;

  // TODO: support toggling between Access History and Edit History
  return (
    <>
      <PageTitle title={`Access History for ${user.name}`} />
      <Paper>
        <UserAccessHistoryTable userId={userId} />
      </Paper>
    </>
  );
};

export default UserAuditPage;
