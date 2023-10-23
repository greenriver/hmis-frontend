import { useState } from 'react';

import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { UserFieldsForAdminFragment } from '@/types/gqlTypes';
import { getCsrfToken } from '@/utils/csrf';
import { reloadWindow } from '@/utils/location';

const post = async (userId: string) => {
  const csrf = getCsrfToken();
  const data = {
    user_id: userId,
    authenticity_token: csrf,
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  const url = '/hmis/impersonations';
  const response = await fetch(url, options);
  if (!response.ok)
    throw new Error(`HTTP failed with status ${response.status}`);
  return response.json;
};

interface Props {
  user: UserFieldsForAdminFragment;
  onCancel: VoidFunction;
}
const ConfirmImpersonation: React.FC<Props> = ({ user, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const handleImpersonate = () => {
    setLoading(true);
    post(user.hmisId!)
      .then(reloadWindow)
      .catch((e) => {
        setLoading(false);
        setError(e);
      });
  };
  if (error) throw error;

  return (
    <ConfirmationDialog
      id='deleteFile'
      open={true}
      title='Confirm Action'
      onConfirm={handleImpersonate}
      onCancel={loading ? undefined : onCancel}
      hideCancelButton={loading}
      loading={loading}
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
