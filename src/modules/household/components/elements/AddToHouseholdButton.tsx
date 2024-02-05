import { Button } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import usePrevious from '@/hooks/usePrevious';
import ClientAlertStack from '@/modules/client/components/clientAlerts/ClientAlertStack';
import useClientAlerts from '@/modules/client/hooks/useClientAlerts';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { useProjectCocsCountFromCache } from '@/modules/projects/hooks/useProjectCocsCountFromCache';
import {
  RecordFormRole,
  ClientWithAlertFieldsFragment,
  SubmittedEnrollmentResultFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  client: ClientWithAlertFieldsFragment;
  isMember: boolean;
  householdId?: string; // if omitted, a new household will be created
  projectId: string;
  onSuccess: (householdId: string) => void;
}

const AddToHouseholdButton = ({
  client,
  isMember,
  householdId,
  onSuccess,
  projectId,
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
    }),
    [projectId, clientId, householdId, cocCount, onSuccess]
  );

  const { openFormDialog, renderFormDialog } =
    useFormDialog<SubmittedEnrollmentResultFieldsFragment>(memoedArgs);

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
        preFormComponent: clientAlerts.length > 0 && (
          <ClientAlertStack clientAlerts={clientAlerts} />
        ),
      })}
    </>
  );
};

export default AddToHouseholdButton;
