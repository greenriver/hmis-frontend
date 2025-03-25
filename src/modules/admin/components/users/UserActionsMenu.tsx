import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import {
  AuditIcon,
  ImpersonateIcon,
  OpenInNewIcon,
} from '@/components/elements/SemanticIcons';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  RootPermissionsFragment,
  UserAdminFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  onClickImpersonate: VoidFunction;
  isCurrentUser: boolean;
  user: UserAdminFieldsFragment;
  rootAccess: RootPermissionsFragment;
}

const UserActionsMenu: React.FC<Props> = ({
  onClickImpersonate,
  isCurrentUser,
  user,
  rootAccess,
}) => {
  const menuItems = useMemo(() => {
    const items = [];
    if (rootAccess.canAuditUsers) {
      items.push({
        key: 'audit',
        title: 'Audit User',
        Icon: AuditIcon,
        to: generatePath(AdminDashboardRoutes.USER_CLIENT_ACCESS_HISTORY, {
          userId: user.id,
        }),
        ariaLabel: `Audit ${user.name}`,
      });
    }
    if (rootAccess.canImpersonateUsers) {
      items.push({
        key: 'impersonate',
        onClick: onClickImpersonate,
        title: 'Impersonate User',
        Icon: ImpersonateIcon,
        disabled: isCurrentUser,
        ariaLabel: `Impersonate ${user.name}`,
      });
    }
    if (rootAccess.canEditUsersInWarehouse) {
      items.push({
        key: 'edit',
        to: user.manageAccountUrl,
        title: 'Edit Account',
        Icon: OpenInNewIcon,
        openInNew: true,
        ariaLabel: `Edit ${user.name}'s Account in the Warehouse`,
      });
    }
    return items;
  }, [isCurrentUser, onClickImpersonate, rootAccess, user]);

  if (menuItems.length === 0) return null;

  return (
    <CommonMenuButton
      title='User Actions'
      items={menuItems}
      ButtonProps={{
        variant: 'outlined',
      }}
    />
  );
};

export default UserActionsMenu;
