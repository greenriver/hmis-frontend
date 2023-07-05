import { Button } from '@mui/material';
import { useEffect, useState } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import usePrevious from '@/hooks/usePrevious';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { EnrollmentFieldsFragment, FormRole } from '@/types/gqlTypes';

interface Props {
  clientId: string;
  clientName: string;
  isMember: boolean;
  householdId?: string; // if omitted, a new household will be created
  projectId: string;
  onSuccess: (householdId: string) => void;
}

const AddToHouseholdButton = ({
  clientId,
  clientName,
  isMember,
  householdId,
  onSuccess,
  projectId,
}: Props) => {
  const prevIsMember = usePrevious(isMember);
  const [added, setAdded] = useState(isMember);

  useEffect(() => {
    // If client was previously added but has since been removed
    if (prevIsMember && !isMember) {
      setAdded(false);
    }
  }, [prevIsMember, isMember, setAdded]);

  let text = 'Add to Enrollment';
  const color: 'secondary' | 'error' = 'secondary';
  if (added) text = 'Added';

  const { openFormDialog, renderFormDialog } =
    useFormDialog<EnrollmentFieldsFragment>({
      formRole: FormRole.Enrollment,
      onCompleted: (data: EnrollmentFieldsFragment) => {
        setAdded(true);
        onSuccess(data.household.id);
      },
      inputVariables: { projectId, clientId },
      localConstants: { householdId },
    });

  return (
    <>
      <ButtonTooltipContainer
        title={added ? 'Client is already a member of this household' : null}
      >
        <Button
          disabled={added}
          color={color}
          fullWidth
          size='small'
          onClick={openFormDialog}
          sx={{ maxWidth: '180px' }}
        >
          {text}
        </Button>
      </ButtonTooltipContainer>
      {renderFormDialog({
        title: <>Enroll {clientName}</>,
        submitButtonText: `Enroll`,
        pickListRelationId: projectId,
      })}
    </>
  );
};

export default AddToHouseholdButton;
