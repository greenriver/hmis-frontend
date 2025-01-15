import { Button, Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import usePrevious from '@/hooks/usePrevious';

import ClientAlertStack from '@/modules/clientAlerts/components/ClientAlertStack';
import useClientAlerts from '@/modules/clientAlerts/hooks/useClientAlerts';
import { ErrorState } from '@/modules/errors/util';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import ConflictingEnrollmentAlert from '@/modules/household/components/elements/ConflictingEnrollmentAlert';
import JoinHouseholdDialog from '@/modules/household/components/elements/JoinHouseholdDialog';
import { useProjectCocsCountFromCache } from '@/modules/projects/hooks/useProjectCocsCountFromCache';
import {
  ClientWithAlertFieldsFragment,
  HouseholdFieldsFragment,
  RecordFormRole,
  SubmittedEnrollmentResultFieldsFragment,
  ValidationError,
} from '@/types/gqlTypes';

interface Props {
  client: ClientWithAlertFieldsFragment;
  isMember: boolean;
  householdId?: string; // if omitted, a new household will be created
  projectId: string;
  onSuccess: (householdId: string) => void;
  household?: HouseholdFieldsFragment;
}

const AddToHouseholdButton = ({
  client,
  isMember,
  householdId,
  onSuccess,
  projectId,
  household,
}: Props) => {
  const prevIsMember = usePrevious(isMember);
  const [added, setAdded] = useState(isMember);
  const cocCount = useProjectCocsCountFromCache(projectId);

  useEffect(() => {
    // If client was previously added but has since been removed
    if (prevIsMember && !isMember) {
      setAdded(false);
    }
  }, [prevIsMember, isMember, setAdded]);

  let text = householdId ? 'Add to Household' : 'Enroll Client';
  const color: 'secondary' | 'error' = 'secondary';
  if (added) text = 'Added';
  const clientId = client.id;

  const [conflictingEnrollmentId, setConflictingEnrollmentId] = useState<
    string | undefined
  >();

  const memoedArgs = useMemo(
    () => ({
      formRole: RecordFormRole.Enrollment,
      onCompleted: (data: SubmittedEnrollmentResultFieldsFragment) => {
        setAdded(true);
        onSuccess(data.householdId);
      },
      inputVariables: { projectId, clientId },
      pickListArgs: { projectId, householdId },
      localConstants: { householdId, projectCocCount: cocCount },
      errorFilter: (error: ValidationError) => {
        // If there's an error about a conflicting enrollment, we will show the ConflictingEnrollmentAlert,
        // so here, we filter that error out of the ErrorAlert displayed by the form dialog.
        if (!householdId) return true; // Except if this is a new household. Then show the error, since we can't Join Households.
        if (!error.data) return true;
        return !error.data?.hasOwnProperty('conflictingEnrollmentId');
      },
      onChangeErrors: (errors: ErrorState) => {
        const error = errors.errors.find((e) =>
          e.data?.hasOwnProperty('conflictingEnrollmentId')
        );
        if (error) {
          setConflictingEnrollmentId(error.data.conflictingEnrollmentId);
        }
      },
    }),
    [projectId, clientId, householdId, cocCount, onSuccess]
  );

  const { openFormDialog, renderFormDialog, closeDialog } =
    useFormDialog<SubmittedEnrollmentResultFieldsFragment>(memoedArgs);

  const [joinHouseholdDialogOpen, setJoinHouseholdDialogOpen] = useState(false);

  const { clientAlerts } = useClientAlerts({ client: client });

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
        title: <>Enroll {clientBriefName(client)}</>,
        submitButtonText: `Enroll`,
        preFormComponent: (
          <Stack gap={2}>
            {clientAlerts.length > 0 && (
              <ClientAlertStack clientAlerts={clientAlerts} />
            )}
            {household && conflictingEnrollmentId && (
              <ConflictingEnrollmentAlert
                joiningClient={client}
                receivingHousehold={household}
                conflictingEnrollmentId={conflictingEnrollmentId}
                onClickJoinEnrollment={() => {
                  closeDialog();
                  setJoinHouseholdDialogOpen(true);
                }}
              />
            )}
          </Stack>
        ),
      })}
      {/*todo @martha - don't forget to put all household alerts in the new join dialog*/}
      {household && conflictingEnrollmentId && (
        <JoinHouseholdDialog
          open={joinHouseholdDialogOpen}
          conflictingEnrollmentId={conflictingEnrollmentId}
          onClose={() => setJoinHouseholdDialogOpen(false)} // todo @martha - clear out rest of state on close
          receivingHousehold={household}
        />
      )}
    </>
  );
};

export default AddToHouseholdButton;
