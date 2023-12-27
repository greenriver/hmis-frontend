import { Box, Paper, Typography } from '@mui/material';
import { formatISO, subWeeks } from 'date-fns';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import Loading from '@/components/elements/Loading';
import {
  ClientIcon,
  EnrollmentIcon,
} from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import ClientAccessSummaryTable from '@/modules/admin/components/users/ClientAccessSummaryTable';
import EnrollmentAccessSummaryTable from '@/modules/admin/components/users/EnrollmentAccessSummaryTable';
import { useUser } from '@/modules/dataFetching/hooks/useUser';
import { AdminDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

type EntityType = 'clients' | 'enrollments';

const toggleItems: ToggleItem<EntityType>[] = [
  {
    value: 'clients',
    label: 'Clients',
    Icon: ClientIcon,
  },
  {
    value: 'enrollments',
    label: 'Enrollments',
    Icon: EnrollmentIcon,
  },
];

interface Props {
  entityType: EntityType;
}
const UserAuditPage: React.FC<Props> = ({ entityType }) => {
  const { userId } = useSafeParams() as { userId: string };
  const { user, loading } = useUser(userId);
  const navigate = useNavigate();
  const defaultStartDate = useMemo<string>(() => {
    const today = new Date();
    const twoWeeksAgo = subWeeks(today, 2);
    return formatISO(twoWeeksAgo);
  }, []);

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
      <Paper>
        <Box mt={2} px={2}>
          <Typography variant='subtitle1'>View user access by</Typography>
          <CommonToggle
            sx={{ my: 2 }}
            value={entityType}
            onChange={handleTabChange}
            items={toggleItems}
            size='small'
            variant='gray'
          />
        </Box>
        {entityType == 'clients' ? (
          <ClientAccessSummaryTable
            userId={userId}
            startDate={defaultStartDate}
          />
        ) : (
          <EnrollmentAccessSummaryTable
            userId={userId}
            startDate={defaultStartDate}
          />
        )}
      </Paper>
    </>
  );
};

export default UserAuditPage;
