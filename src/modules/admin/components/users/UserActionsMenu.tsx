import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import { AdminDashboardRoutes } from '@/routes/routes';
import { RootPermissionsFragment } from '@/types/gqlTypes';

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
  const menuItems = useMemo(() => {
    const items = [];
    if (rootAccess.canAuditUsers) {
      items.push({
        key: 'audit',
        title: 'Audit User',
        to: generatePath(AdminDashboardRoutes.USER_CLIENT_ACCESS_HISTORY, {
          userId,
        }),
      });
    }
    if (rootAccess.canImpersonateUsers) {
      items.push({
        key: 'impersonate',
        onClick: onClickImpersonate,
        title: 'Impersonate User',
        disabled: isCurrentUser,
      });
    }
    return items;
  }, [
    isCurrentUser,
    onClickImpersonate,
    rootAccess.canAuditUsers,
    rootAccess.canImpersonateUsers,
    userId,
  ]);

  if (menuItems.length === 0) return null;

  return (
    <CommonMenuButton
      title='User Actions'
      items={menuItems}
      variant='outlined'
    />
  );
};

export default UserActionsMenu;
