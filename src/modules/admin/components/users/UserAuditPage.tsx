import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import { Paper } from '@mui/material';
// import { formatISO, subWeeks } from 'date-fns';
import { generatePath, useNavigate } from 'react-router-dom';

import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import LabelWithContent from '@/components/elements/LabelWithContent';
import Loading from '@/components/elements/Loading';
import { PersonIcon } from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import UserAccessHistory, {
  AccessEntityType,
} from '@/modules/admin/components/users/UserAccessHistory';
import UserAuditHistory from '@/modules/admin/components/users/UserAuditHistory';
import UserLoginActivity from '@/modules/admin/components/users/UserLoginActivity';
import { useUser } from '@/modules/dataFetching/hooks/useUser';
import { AdminDashboardRoutes } from '@/routes/routes';

// TODO: replace toggle with CommonTabs, updated pattern for this type of navigation
type UserHistoryType = 'access' | 'edits' | 'logins';
const historyTypeToggleItems: ToggleItem<UserHistoryType>[] = [
  {
    value: 'access',
    label: 'User Access',
    Icon: AccessTimeIcon,
  },
  {
    value: 'edits',
    label: 'User Edits',
    Icon: EditIcon,
  },
  {
    value: 'logins',
    label: 'Login Activity',
    Icon: PersonIcon,
  },
];

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
  const navigate = useNavigate();

  if (!user && loading) return <Loading />;
  if (!user) return <NotFound />;

  const handleHistoryTypeToggleChange = (value: UserHistoryType) => {
    switch (value) {
      case 'access':
        navigate(
          generatePath(AdminDashboardRoutes.USER_CLIENT_ACCESS_HISTORY, {
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

  return (
    <>
      <PageTitle title={`${user.name} Audit History`} />
      <LabelWithContent
        label='Audit History Type'
        labelId='page-type-label'
        renderChildren={(labelElement) => (
          <CommonToggle
            sx={{ mb: 3 }}
            value={userHistoryType}
            onChange={handleHistoryTypeToggleChange}
            items={historyTypeToggleItems}
            aria-labelledby={
              (labelElement && labelElement.getAttribute('id')) || undefined
            }
          />
        )}
      />
      <Paper>
        {userHistoryType === 'access' && (
          <UserAccessHistory accessEntityType={accessEntityType} />
        )}
        {userHistoryType === 'edits' && <UserAuditHistory />}
        {userHistoryType === 'logins' && <UserLoginActivity />}
      </Paper>
    </>
  );
};

export default UserAuditPage;
