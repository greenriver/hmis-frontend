import { Paper } from '@mui/material';

import { useEffect, useMemo } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import CommonTabs from '@/components/elements/CommonTabs';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useAdminDashboardContext } from '@/modules/admin/components/AdminDashboard';
import UserAccessHistory, {
  AccessEntityType,
} from '@/modules/admin/components/users/UserAccessHistory';
import UserAuditHistory from '@/modules/admin/components/users/UserAuditHistory';
import UserLoginHistory from '@/modules/admin/components/users/UserLoginHistory';
import { useUser } from '@/modules/dataFetching/hooks/useUser';
import { AdminDashboardRoutes } from '@/routes/routes';

type UserHistoryType = 'access' | 'edits' | 'logins';

interface Props {
  userHistoryType: UserHistoryType;
  accessEntityType?: AccessEntityType;
}
const UserAuditPage: React.FC<Props> = ({
  userHistoryType,
  accessEntityType,
}) => {
  const { userId } = useSafeParams() as { userId: string };
  const { user, loading } = useUser(userId);
  const { overrideBreadcrumbTitles } = useAdminDashboardContext();
  const navigate = useNavigate();

  // Set the breadcrumb so it says the correct name of this user
  useEffect(() => {
    if (!user) return;

    const title = `${user?.name} Audit`;
    overrideBreadcrumbTitles({
      [AdminDashboardRoutes.USER_ENROLLMENT_ACCESS_HISTORY]: title,
      [AdminDashboardRoutes.USER_CLIENT_ACCESS_HISTORY]: title,
      [AdminDashboardRoutes.USER_EDIT_HISTORY]: title,
      [AdminDashboardRoutes.USER_LOGIN_ACTIVITY]: title,
    });
  }, [overrideBreadcrumbTitles, user]);

  const handleHistoryTypeToggleChange = (value: string) => {
    switch (value) {
      case 'access':
        navigate(
          generatePath(AdminDashboardRoutes.USER_ENROLLMENT_ACCESS_HISTORY, {
            userId,
          })
        );
        break;
      case 'edits':
        navigate(
          generatePath(AdminDashboardRoutes.USER_EDIT_HISTORY, {
            userId,
          })
        );
        break;
      case 'logins':
        navigate(
          generatePath(AdminDashboardRoutes.USER_LOGIN_ACTIVITY, {
            userId,
          })
        );
        break;
    }
  };

  const tabDefinitions = useMemo(
    () => [
      {
        key: 'access',
        title: 'Viewed Client Data',
        contents: <UserAccessHistory accessEntityType={accessEntityType} />,
      },
      {
        key: 'edits',
        title: 'Edit History',
        contents: (
          <Paper>
            <UserAuditHistory />
          </Paper>
        ),
      },
      {
        key: 'logins',
        title: 'Login History',
        contents: (
          <Paper>
            <UserLoginHistory />
          </Paper>
        ),
      },
    ],
    [accessEntityType]
  );

  if (!user && loading) return <Loading />;
  if (!user) return <NotFound />;

  return (
    <>
      <PageTitle title={`${user.name} Audit History`} />
      <CommonTabs
        tabDefinitions={tabDefinitions}
        ariaLabel={'audit history types'}
        currentTab={userHistoryType}
        onChangeTab={(key) => handleHistoryTypeToggleChange(key)}
      />
    </>
  );
};

export default UserAuditPage;
