import { Stack } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import LoadingButton from '@/components/elements/LoadingButton';
import { formatDateForGql } from '@/modules/hmis/hmisUtil';
import {
  BulkAssignServiceMutationFn,
  BulkRemoveServiceMutationFn,
  BulkServicesClientSearchQuery,
} from '@/types/gqlTypes';

interface Props {
  clients: BulkServicesClientSearchQuery['clientSearch']['nodes']; // selected clients
  dateProvided: Date;
  projectId: string;
  serviceTypeId: string;
  cocCode?: string;
  bulkAssign: BulkAssignServiceMutationFn;
  bulkRemove: BulkRemoveServiceMutationFn;
}

type LoadingStates = {
  assign: boolean;
  remove: boolean;
};

const initialLoadingState = {
  assign: false,
  remove: false,
};

const MultiAssignServiceButton: React.FC<Props> = ({
  clients,
  dateProvided,
  projectId,
  serviceTypeId,
  cocCode,
  bulkAssign,
  bulkRemove,
}) => {
  const [loading, setLoading] = useState<LoadingStates>(initialLoadingState);

  const { toAssign, toRemove, numToEnroll } = useMemo(() => {
    const toAssign: string[] = [];
    const toRemove: string[] = [];
    let numToEnroll: number = 0;
    clients.forEach(({ id, activeEnrollment }) => {
      if (activeEnrollment) {
        if (activeEnrollment.services.nodesCount === 0) {
          toAssign.push(id); // client to assign
        } else {
          toRemove.push(id); // client with service(s) to remove
        }
      } else {
        numToEnroll += 1;
        toAssign.push(id); // client to assign + enroll
      }
    });
    return { toAssign, toRemove, numToEnroll };
  }, [clients]);

  const handleAssign = useCallback(() => {
    // Set loading indicator on Assign button
    setLoading((old) => ({ ...old, assign: true }));

    bulkAssign({
      variables: {
        input: {
          projectId,
          clientIds: toAssign,
          dateProvided: formatDateForGql(dateProvided) || '',
          serviceTypeId,
          cocCode,
        },
      },
    });
  }, [bulkAssign, cocCode, dateProvided, projectId, serviceTypeId, toAssign]);

  const handleRemove = useCallback(() => {
    // Service IDs to remove
    const serviceIds = clients
      .map((c) => (c.activeEnrollment?.services?.nodes || []).map((s) => s.id))
      .flat();

    // Set loading indicator on Remove button
    setLoading((old) => ({ ...old, remove: true }));
    // Perform mutation
    bulkRemove({ variables: { projectId, serviceIds } });
  }, [clients, bulkRemove, projectId]);

  const disabledMessage =
    toRemove.length > 0 && toAssign.length > 0
      ? `To remove multiple services, please only select clients that are assigned on the specified date.`
      : null;

  return (
    <Stack direction='row' gap={2}>
      <LoadingButton
        onClick={handleAssign}
        disabled={toAssign.length === 0}
        loading={loading.assign}
      >
        {numToEnroll > 0
          ? `Enroll (${numToEnroll}) + Assign (${toAssign.length})`
          : `Assign (${toAssign.length})`}
      </LoadingButton>
      <ButtonTooltipContainer title={disabledMessage}>
        <LoadingButton
          onClick={handleRemove}
          color='error'
          disabled={toRemove.length === 0 || !!disabledMessage}
          loading={loading.remove}
        >
          {`Remove (${toRemove.length})`}
        </LoadingButton>
      </ButtonTooltipContainer>
    </Stack>
  );
};

export default MultiAssignServiceButton;
