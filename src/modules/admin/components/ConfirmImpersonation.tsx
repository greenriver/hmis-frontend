import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import useAuth from '@/modules/auth/hooks/useAuth';
import { ApplicationUserFieldsFragment } from '@/types/gqlTypes';

interface Props {
  user: ApplicationUserFieldsFragment;
  onCancel: VoidFunction;
}
const ConfirmImpersonation: React.FC<Props> = ({ user, onCancel }) => {
  const { impersonateUser } = useAuth();

  const handleImpersonate = () => {
    impersonateUser(user.id);
  };

  return (
    <ConfirmationDialog
      id='deleteFile'
      open={true}
      title='Confirm Action'
      onConfirm={handleImpersonate}
      onCancel={onCancel}
      loading={false}
    >
      <div>
        <p>Are you sure you impersonate this user?</p>
        <CommonUnstyledList>
          <li>User ID: {user.id}</li>
          <li>User Name: {user.name}</li>
        </CommonUnstyledList>
      </div>
    </ConfirmationDialog>
  );
};
export default ConfirmImpersonation;
