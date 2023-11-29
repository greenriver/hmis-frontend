import CommonMenuButton from '@/components/elements/CommonMenuButton';
import { AdminDashboardRoutes } from '@/routes/routes';
import { RootPermissionsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  onClickImpersonate: VoidFunction;
  isCurrentUser: boolean;
  userId: string;
  rootAccess: RootPermissionsFragment;
}

const UserActionsMenu: React.FC<Props> = ({
  onClickImpersonate,
  isCurrentUser,
  userId,
  rootAccess,
}) => {
  const items = [];
  if (rootAccess.canImpersonateUsers) {
    items.push({
      key: 'impersonate',
      onClick: onClickImpersonate,
      title: 'Impersonate User',
      disabled: isCurrentUser,
    });
  }

  if (rootAccess.canAuditUsers) {
    items.push({
      key: 'access-history',
      title: 'View Access History',
      to: generateSafePath(AdminDashboardRoutes.USER_ACCESS_HISTORY, {
        userId,
      }),
    });
  }

  return (
    <CommonMenuButton title='User Actions' items={items} variant='outlined' />
  );
};

export default UserActionsMenu;
