import { Paper } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import ClientAccessSummaryTable from '@/modules/admin/components/users/ClientAccessSummaryTable';
import EnrollmentAccessSummaryTable from '@/modules/admin/components/users/EnrollmentAccessSummaryTable';
import { useUser } from '@/modules/dataFetching/hooks/useUser';
import { AdminDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

type EntityType = 'clients' | 'enrollments';

interface Props {
  entityType: EntityType;
}

const toggleItems: ToggleItem<EntityType>[] = [
  {
    value: 'clients',
    label: 'Clients',
  },
  {
    value: 'enrollments',
    label: 'Enrollments',
  },
];

const UserAuditPage: React.FC<Props> = ({ entityType }) => {
  const { userId } = useSafeParams() as { userId: string };
  const { user, loading } = useUser(userId);
  const navigate = useNavigate();

  if (!user && loading) return <Loading />;
  if (!user) return <NotFound />;

  const handleTabChange = (value: EntityType) => {
    switch (value) {
      case 'clients':
        navigate(
          generateSafePath(AdminDashboardRoutes.USER_CLIENT_ACCESS_HISTORY, {
            userId,
          })
        );
        break;
      case 'enrollments':
        navigate(
          generateSafePath(
            AdminDashboardRoutes.USER_ENROLLMENT_ACCESS_HISTORY,
            { userId }
          )
        );
        break;
    }
  };

  return (
    <>
      <PageTitle title={`Access History for ${user.name}`} />
      <CommonToggle
        sx={{ my: 2 }}
        value={entityType}
        onChange={handleTabChange}
        items={toggleItems}
        size='small'
        variant='gray'
      />
      <Paper>
        {entityType == 'clients' ? (
          <ClientAccessSummaryTable userId={userId} />
        ) : (
          <EnrollmentAccessSummaryTable userId={userId} />
        )}
      </Paper>
    </>
  );
};

export default UserAuditPage;
