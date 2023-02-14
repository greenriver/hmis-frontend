import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
  useDeleteEnrollmentMutation,
} from '@/types/gqlTypes';

const RemoveFromHouseholdButton = ({
  householdClient,
  clientId,
  onSuccess,
  disabled,
}: {
  householdClient: HouseholdClientFieldsFragment;
  clientId: string;
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

  const disabledReason = useMemo(() => {
    if (!householdClient.enrollment.inProgress) {
      return 'Client with completed enrollment cannot be removed. Exit the client instead.';
    } else if (
      householdClient.relationshipToHoH ===
      RelationshipToHoH.SelfHeadOfHousehold
    ) {
      return 'Head of Household cannot be removed.';
    } else if (householdClient.client.id === clientId) {
      return "Currently active client cannot be removed. Go to another member's profile to remove them.";
    }
  }, [householdClient, clientId]);

  const onClick = useMemo(
    () => () => {
      void deleteEnrollment({
        variables: {
          input: {
            id: householdClient.enrollment.id,
          },
        },
      });
    },
    [householdClient, deleteEnrollment]
  );

  const isDisabled = !!disabledReason || disabled || loading || done || !!error;

  return (
    <ButtonTooltipContainer title={disabledReason} placement='top'>
      <LoadingButton
        loading={loading}
        fullWidth
        variant='outlined'
        color='error'
        disabled={isDisabled}
        onClick={disabledReason ? undefined : onClick}
        sx={{
          root: {
            '&.Mui-disabled': {
              pointerEvents: 'auto',
            },
          },
        }}
      >
        {done ? 'Removed' : 'Remove'}
      </LoadingButton>
    </ButtonTooltipContainer>
  );
};
export default RemoveFromHouseholdButton;
