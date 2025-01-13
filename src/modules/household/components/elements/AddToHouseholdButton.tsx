import { Button, Stack } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import usePrevious from '@/hooks/usePrevious';

import ClientAlertStack from '@/modules/clientAlerts/components/ClientAlertStack';
import useClientAlerts from '@/modules/clientAlerts/hooks/useClientAlerts';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { clientBriefName, formatDateForGql } from '@/modules/hmis/hmisUtil';
import ConflictingEnrollmentAlert from '@/modules/household/components/elements/ConflictingEnrollmentAlert';
import JoinHouseholdDialog from '@/modules/household/components/elements/JoinHouseholdDialog';
import { useProjectCocsCountFromCache } from '@/modules/projects/hooks/useProjectCocsCountFromCache';
import {
  ClientWithAlertFieldsFragment,
  HouseholdFieldsFragment,
  RecordFormRole,
  SubmittedEnrollmentResultFieldsFragment,
  useGetClientEnrollmentWithHouseholdQuery,
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

  // todo @martha - if this is initially selected, it doesn't load
  // todo @martha - need to add some kind of indication in the UI that this is loading, maybe just the enroll button is disabled
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());

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
      onFieldChange: (linkId?: string, value?: any) => {
        if (linkId === 'entry_date') {
          setEntryDate(value);
        }
      },
    }),
    [projectId, clientId, householdId, cocCount, onSuccess]
  );

  const { openFormDialog, renderFormDialog } =
    useFormDialog<SubmittedEnrollmentResultFieldsFragment>(memoedArgs);

  const { clientAlerts } = useClientAlerts({ client: client });

  // todo @martha - add error
  const { data: { client: clientWithEnrollment } = {}, loading } =
    useGetClientEnrollmentWithHouseholdQuery({
      variables: {
        id: client.id,
        filters: {
          openOnDate: formatDateForGql(entryDate || new Date()), // entryDate will be non-null bc of skip
          project: [projectId],
        },
      },
      skip: !entryDate,
    });
  console.log(loading); // todo @martha - improve the loading experience

  const openEnrollmentOnDate = useMemo(() => {
    const nodes = clientWithEnrollment?.enrollments.nodes;
    if (nodes && nodes.length > 0) return nodes[0];
  }, [clientWithEnrollment]);
  // todo @martha - if it has a conflicting enrollment, disable the Enroll button

  const [joinHouseholdDialogOpen, setJoinHouseholdDialogOpen] = useState(false);

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
            {/*todo @martha - test this more thoroughly with a past enrollment*/}
            {/*todo @martha - what about enrolling someone for the 1st time (not in a household) but they already have a conflicting enrollment - should be no change to behavior*/}
            {household && openEnrollmentOnDate && (
              <ConflictingEnrollmentAlert
                joiningClient={client}
                receivingHousehold={household}
                conflictingEnrollmentId={openEnrollmentOnDate.id}
                onClickJoinEnrollment={() => {
                  // todo @martha - close the regular dialog
                  setJoinHouseholdDialogOpen(true);
                }}
              />
            )}
          </Stack>
        ),
      })}
      {/*todo @martha - don't forget to put all household alerts in the new join dialog*/}
      {household && openEnrollmentOnDate && (
        <JoinHouseholdDialog
          open={joinHouseholdDialogOpen}
          conflictingEnrollment={openEnrollmentOnDate}
          onClose={() => setJoinHouseholdDialogOpen(false)} // todo @martha - clear out rest of state on close
          receivingHousehold={household}
        />
      )}
    </>
  );
};

export default AddToHouseholdButton;
