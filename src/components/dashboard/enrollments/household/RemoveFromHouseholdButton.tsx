import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';

import { useDeleteEnrollmentMutation } from '@/types/gqlTypes';

const RemoveFromHouseholdButton = ({
  enrollmentId,
  onSuccess,
  disabled,
}: {
  enrollmentId: string;
  onSuccess: () => void;
  disabled?: boolean;
}) => {
  const [done, setDone] = useState(false);
  const [deleteEnrollment, { loading, error }] = useDeleteEnrollmentMutation({
    onCompleted: () => {
      setDone(true);
      onSuccess();
    },
  });

  const onClick = useMemo(
    () => () => {
      void deleteEnrollment({
        variables: {
          input: {
            id: enrollmentId,
          },
        },
      });
    },
    [enrollmentId, deleteEnrollment]
  );

  return (
    <LoadingButton
      loading={loading}
      loadingIndicator='Removing...'
      fullWidth
      variant='outlined'
      color='error'
      // size='small'
      disabled={disabled || loading || done || !!error}
      onClick={onClick}
    >
      {done ? 'Removed' : 'Remove'}
    </LoadingButton>
  );
};
export default RemoveFromHouseholdButton;
