import { Button } from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';

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

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
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
  if (loading) text = 'Adding...';
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
            startDate: format(startDate || new Date(), 'yyyy-MM-dd'),
          },
        },
      }),
    [addHouseholdMember, clientId, relationshipToHoH, startDate, householdId]
  );

  return (
    <Button
      disabled={added || loading}
      color={color}
      fullWidth
      size='small'
      onClick={onClick}
      sx={{ maxWidth: '180px' }}
    >
      {text}
    </Button>
  );
};

export default AddToHouseholdButton;
