import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';

import LoadingButton from '@/components/elements/LoadingButton';
import usePrevious from '@/hooks/usePrevious';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import {
  RelationshipToHoH,
  useAddHouseholdMembersMutation,
} from '@/types/gqlTypes';

interface Props {
  clientId: string;
  isMember: boolean;
  householdId: string;
  onSuccess: () => void;
  relationshipToHoH?: RelationshipToHoH | null;
  startDate?: Date | null;
}

const AddToHouseholdButton = ({
  clientId,
  isMember,
  householdId,
  relationshipToHoH,
  startDate,
  onSuccess,
}: Props) => {
  const prevIsMember = usePrevious(isMember);
  const [added, setAdded] = useState(isMember);

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const [addHouseholdMember, { loading }] = useAddHouseholdMembersMutation({
    onCompleted: (data) => {
      const errors = data.addHouseholdMembersToEnrollment?.errors || [];

      if (errors.length > 0) {
        setErrorState(partitionValidations(errors));
      } else {
        setErrorState(emptyErrorState);
        setAdded(true);
        onSuccess();
      }
    },
    onError: (apolloError) =>
      setErrorState({ ...emptyErrorState, apolloError }),
  });

  const { renderValidationDialog } = useValidationDialog({
    errorState,
    includeErrors: true,
  });

  useEffect(() => {
    // If client was previously added but has since been removed
    if (prevIsMember && !isMember) {
      setAdded(false);
    }
  }, [prevIsMember, isMember, setAdded]);

  let text = 'Add to Enrollment';
  const color: 'secondary' | 'error' = 'secondary';
  if (added) text = 'Added';
  // if (hasErrors(errorState)) {
  //   text = 'Error';
  //   color = 'error';
  // }

  const handleSubmit = useCallback(
    (confirmed: boolean) => () =>
      addHouseholdMember({
        variables: {
          input: {
            householdId,
            householdMembers: [
              {
                id: clientId,
                relationshipToHoH:
                  relationshipToHoH || RelationshipToHoH.DataNotCollected,
              },
            ],
            entryDate: format(startDate || new Date(), 'yyyy-MM-dd'),
            confirmed,
          },
        },
      }),
    [addHouseholdMember, clientId, relationshipToHoH, startDate, householdId]
  );

  return (
    <>
      <LoadingButton
        disabled={added || loading}
        color={color}
        fullWidth
        size='small'
        onClick={handleSubmit(false)}
        sx={{ maxWidth: '180px' }}
        loading={loading}
      >
        {text}
      </LoadingButton>
      {renderValidationDialog({
        onConfirm: handleSubmit(true),
        loading,
      })}
    </>
  );
};

export default AddToHouseholdButton;
