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
        Are you sure you want to impersonate <b>{user.name}</b>?
      </div>
    </ConfirmationDialog>
  );
};
export default ConfirmImpersonation;
