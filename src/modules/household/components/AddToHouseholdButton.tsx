import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

import LoadingButton from '@/components/elements/LoadingButton';
import usePrevious from '@/hooks/usePrevious';
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
  const [addHouseholdMember, { loading, error }] =
    useAddHouseholdMembersMutation({
      onCompleted: () => {
        setAdded(true);
        onSuccess();
      },
    });

  useEffect(() => {
    // If client was previously added but has since been removed
    if (prevIsMember && !isMember) {
      setAdded(false);
    }
  }, [prevIsMember, isMember, setAdded]);

  let text = 'Add to Enrollment';
  let color: 'secondary' | 'error' = 'secondary';
  if (added) text = 'Added';
  if (error) {
    text = 'Error';
    color = 'error';
  }

  const onClick = useMemo(
    () => () =>
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
          },
        },
      }),
    [addHouseholdMember, clientId, relationshipToHoH, startDate, householdId]
  );

  return (
    <LoadingButton
      disabled={added || loading}
      color={color}
      fullWidth
      size='small'
      onClick={onClick}
      sx={{ maxWidth: '180px' }}
      loading={loading}
    >
      {text}
    </LoadingButton>
  );
};

export default AddToHouseholdButton;
