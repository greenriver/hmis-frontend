import { Button, Stack } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import usePrevious from '@/hooks/usePrevious';

import ClientAlertStack from '@/modules/clientAlerts/components/ClientAlertStack';
import useClientAlerts from '@/modules/clientAlerts/hooks/useClientAlerts';
import { ErrorState } from '@/modules/errors/util';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import ConflictingEnrollmentAlert from '@/modules/household/components/elements/ConflictingEnrollmentAlert';
import JoinHouseholdDialog from '@/modules/household/components/householdActions/JoinHouseholdDialog';
import { useProjectCocsCountFromCache } from '@/modules/projects/hooks/useProjectCocsCountFromCache';
import {
  ClientWithAlertFieldsFragment,
  HouseholdFieldsFragment,
  ProjectAllFieldsFragment,
  RecordFormRole,
  SubmittedEnrollmentResultFieldsFragment,
  ValidationError,
} from '@/types/gqlTypes';

interface Props {
  client: ClientWithAlertFieldsFragment;
  isMember: boolean;
  householdId?: string; // if omitted, a new household will be created
  project: Pick<ProjectAllFieldsFragment, 'id' | 'projectName' | 'access'>;
  onSuccess: (householdId: string) => void;
  household?: HouseholdFieldsFragment;
}

const AddToHouseholdButton = ({
  client,
  isMember,
  householdId,
  onSuccess,
  project,
  household,
}: Props) => {
  const prevIsMember = usePrevious(isMember);
  const [added, setAdded] = useState(isMember);
  const cocCount = useProjectCocsCountFromCache(project.id);

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
      inputVariables: { projectId: project.id, clientId },
      pickListArgs: { projectId: project.id, householdId },
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
    [project.id, clientId, householdId, cocCount, onSuccess]
  );

  const { openFormDialog, renderFormDialog, closeDialog } =
    useFormDialog<SubmittedEnrollmentResultFieldsFragment>(memoedArgs);

  const [joinHouseholdDialogOpen, setJoinHouseholdDialogOpen] = useState(false);

  const { clientAlerts } = useClientAlerts({ client: client });

  const clientAlertsComponent = useMemo(
    () =>
      clientAlerts.length > 0 ? (
        <ClientAlertStack clientAlerts={clientAlerts} />
      ) : undefined,
    [clientAlerts]
  );

  const onCloseJoinHousehold = useCallback(() => {
    setJoinHouseholdDialogOpen(false);
    setConflictingEnrollmentId(undefined);
  }, []);

  const onCompleteJoinHousehold = useCallback(
    (joinedHousehold: HouseholdFieldsFragment) => {
      // This only updates the initiating client's button
      if (
        joinedHousehold.householdClients.find(
          (hc) => hc.client.id === client.id
        )
      ) {
        setAdded(true);
      }
    },
    [client.id]
  );

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
        // This wrapper is necessary around the preFormComponent Stack,
        // otherwise the form dialog renders some awkward extra spacing.
        // It could be fixed more systematically with some updates to renderFormDialog's internals.
        preFormComponent:
          !!clientAlertsComponent || (household && conflictingEnrollmentId) ? (
            <Stack gap={2}>
              {clientAlertsComponent}
              {household && conflictingEnrollmentId && (
                <ConflictingEnrollmentAlert
                  project={project}
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
          ) : undefined,
      })}
      {household && conflictingEnrollmentId && (
        <JoinHouseholdDialog
          open={joinHouseholdDialogOpen}
          conflictingEnrollmentId={conflictingEnrollmentId}
          onClose={onCloseJoinHousehold}
          onComplete={onCompleteJoinHousehold}
          receivingHousehold={household}
          project={project}
        />
      )}
    </>
  );
};

export default AddToHouseholdButton;
