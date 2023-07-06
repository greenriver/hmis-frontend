import { useCallback, useEffect, useState } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import LoadingButton from '@/components/elements/LoadingButton';
import usePrevious from '@/hooks/usePrevious';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { formatDateForGql } from '@/modules/hmis/hmisUtil';
import {
  HouseholdFieldsFragment,
  RelationshipToHoH,
  useAddToHouseholdMutation,
} from '@/types/gqlTypes';

interface Props {
  clientId: string;
  isMember: boolean;
  householdId?: string; // if omitted, a new household will be created
  projectId: string;
  onSuccess: (household: HouseholdFieldsFragment) => void;
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
  projectId,
}: Props) => {
  const prevIsMember = usePrevious(isMember);
  const [added, setAdded] = useState(isMember);

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const [addHouseholdMember, { loading }] = useAddToHouseholdMutation({
    onCompleted: (data) => {
      if (!data.addToHousehold) return;
      const { household, errors } = data.addToHousehold;
      if (errors && errors.length > 0) {
        setErrorState(partitionValidations(errors));
      } else if (household) {
        setErrorState(emptyErrorState);
        setAdded(true);
        onSuccess(household);
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
    (confirmed: boolean) => () => {
      if (!startDate) return;

      addHouseholdMember({
        variables: {
          input: {
            projectId,
            householdId,
            clientId,
            relationshipToHoh: householdId
              ? relationshipToHoH || RelationshipToHoH.DataNotCollected
              : RelationshipToHoH.SelfHeadOfHousehold,
            entryDate: formatDateForGql(startDate) || '',
            confirmed,
          },
        },
      });
    },
    [
      addHouseholdMember,
      clientId,
      relationshipToHoH,
      startDate,
      householdId,
      projectId,
    ]
  );

  return (
    <>
      <ButtonTooltipContainer
        title={
          added
            ? 'Client is already a member of this household'
            : !startDate
            ? 'Select Entry Date before adding client'
            : null
        }
      >
        <LoadingButton
          disabled={added || !startDate || loading}
          color={color}
          fullWidth
          size='small'
          onClick={handleSubmit(false)}
          sx={{ maxWidth: '180px' }}
          loading={loading}
        >
          {text}
        </LoadingButton>
      </ButtonTooltipContainer>
      {renderValidationDialog({
        onConfirm: handleSubmit(true),
        loading,
      })}
    </>
  );
};

export default AddToHouseholdButton;
