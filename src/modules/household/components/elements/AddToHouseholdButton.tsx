import { Button, Stack } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import usePrevious from '@/hooks/usePrevious';

import ClientAlertStack from '@/modules/clientAlerts/components/ClientAlertStack';
import useClientAlerts from '@/modules/clientAlerts/hooks/useClientAlerts';
import { ErrorState } from '@/modules/errors/util';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import ConflictingEnrollmentAlert from '@/modules/household/components/householdActions/ConflictingEnrollmentAlert';
import JoinHouseholdDialog from '@/modules/household/components/householdActions/JoinHouseholdDialog';
import { ManageHouseholdProject } from '@/modules/household/components/ManageHousehold';
import { useProjectCocsCountFromCache } from '@/modules/projects/hooks/useProjectCocsCountFromCache';
import {
  ClientSearchResultFieldsFragment,
  HouseholdFieldsFragment,
  RecordFormRole,
  SubmittedEnrollmentResultFieldsFragment,
  ValidationError,
} from '@/types/gqlTypes';

interface Props {
  client: ClientSearchResultFieldsFragment;
  isMember: boolean;
  householdId?: string; // if omitted, a new household will be created
  project: ManageHouseholdProject;
  onSuccess: (householdId: string) => void;
  household?: HouseholdFieldsFragment;
  disabled?: boolean;
}

const AddToHouseholdButton = ({
  client,
  isMember,
  onSuccess,
  project,
  household,
  disabled,
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

  let text = household ? 'Add to Household' : 'Enroll Client';
  const color: 'primary' | 'error' = 'primary';
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
      pickListArgs: { projectId: project.id, householdId: household?.id },
      localConstants: { householdId: household?.id, projectCocCount: cocCount },
      errorFilter: (error: ValidationError) => {
        // If there's an error about a conflicting enrollment, and we're adding to an existing household,
        // then we will show the ConflictingEnrollmentAlert (so filter it out from the ErrorAlert display)
        return !(
          household?.id && error.data?.hasOwnProperty('conflictingEnrollmentId')
        );
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
    [project.id, clientId, cocCount, onSuccess, household?.id]
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

  const onJoinHouseholdSuccess = useCallback(
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
          disabled={added || disabled}
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
        // TODO(#7234) This wrapper is necessary around the preFormComponent Stack,
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
          initiatorEnrollmentId={conflictingEnrollmentId}
          onClose={onCloseJoinHousehold}
          onSuccess={onJoinHouseholdSuccess}
          receivingHousehold={household}
          project={project}
        />
      )}
    </>
  );
};

export default AddToHouseholdButton;
