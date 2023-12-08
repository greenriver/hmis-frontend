import { useMemo, useState } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import LoadingButton from '@/components/elements/LoadingButton';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
  useDeleteEnrollmentMutation,
} from '@/types/gqlTypes';

interface Props {
  householdClient: HouseholdClientFieldsFragment;
  currentDashboardEnrollmentId?: string;
  onSuccess: () => void;
  disabled?: boolean;
  householdSize: number;
  ariaLabel?: string;
}
const RemoveFromHouseholdButton: React.FC<Props> = ({
  householdClient,
  currentDashboardEnrollmentId,
  onSuccess,
  disabled,
  householdSize,
  ariaLabel,
}) => {
  const [done, setDone] = useState(false);
  const [deleteEnrollment, { loading, error }] = useDeleteEnrollmentMutation({
    onCompleted: () => {
      setDone(true);
      onSuccess();
    },
  });

  const disabledReason = useMemo(() => {
    // If household is being created in the project context, any enrollment can be removed
    if (!currentDashboardEnrollmentId) {
      if (
        householdClient.relationshipToHoH ===
          RelationshipToHoH.SelfHeadOfHousehold &&
        householdSize > 1
      ) {
        return 'HoH cannot be removed. Change HoH or remove other members first.';
      }
      return null;
    }

    if (!householdClient.enrollment.inProgress) {
      return 'Client with completed enrollment cannot be removed. Exit the client instead.';
    } else if (
      householdClient.relationshipToHoH ===
      RelationshipToHoH.SelfHeadOfHousehold
    ) {
      return 'Head of Household cannot be removed.';
    } else if (householdClient.enrollment.id === currentDashboardEnrollmentId) {
      return "Currently active client cannot be removed. Go to another member's profile to remove them.";
    }
  }, [householdClient, householdSize, currentDashboardEnrollmentId]);

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
        aria-label={ariaLabel}
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
