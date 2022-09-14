import { Button } from '@mui/material';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';

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
  const [added, setAdded] = useState(isMember);
  const [addHouseholdMember, { loading, error }] =
    useAddHouseholdMembersMutation({
      onCompleted: () => {
        setAdded(true);
        onSuccess();
      },
    });

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
      disabled={added}
      color={color}
      fullWidth
      size='small'
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

export default AddToHouseholdButton;
