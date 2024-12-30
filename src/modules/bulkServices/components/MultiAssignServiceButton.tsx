import { Stack } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useBulkAssignMutations } from '../hooks/useBulkAssignMutations';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import LoadingButton from '@/components/elements/LoadingButton';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import {
  BulkAssignServiceInput,
  BulkServicesClientSearchQuery,
} from '@/types/gqlTypes';

interface Props {
  // selected clients
  clients: BulkServicesClientSearchQuery['clientSearch']['nodes'];
  queryVariables: Omit<BulkAssignServiceInput, 'clientIds'>;
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
  queryVariables,
}) => {
  const { bulkAssign, bulkRemove, apolloError } = useBulkAssignMutations();

  // Use internal loading state, so that buttons appear as if they are loading even while table refetches.
  // We never clear the loading state in this component, except on error.
  // On success, it will un-mount when the table refetch completes.
  const [loading, setLoading] = useState<LoadingStates>(initialLoadingState);

  useEffect(() => {
    if (apolloError) setLoading(initialLoadingState);
  }, [apolloError]);

  const { clientIdsToAssign, clientIdsToRemove, numToEnroll } = useMemo(() => {
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
    return {
      clientIdsToAssign: toAssign,
      clientIdsToRemove: toRemove,
      numToEnroll,
    };
  }, [clients]);

  const handleAssign = useCallback(() => {
    // Set loading indicator on Assign button
    setLoading((old) => ({ ...old, assign: true }));

    bulkAssign({
      variables: {
        input: {
          ...queryVariables,
          clientIds: clientIdsToAssign,
        },
      },
    });
  }, [bulkAssign, clientIdsToAssign, queryVariables]);

  const handleRemove = useCallback(() => {
    // Service IDs to remove
    const serviceIds = clients
      .map((c) => (c.activeEnrollment?.services?.nodes || []).map((s) => s.id))
      .flat();

    // Set loading indicator on Remove button
    setLoading((old) => ({ ...old, remove: true }));
    // Perform mutation
    bulkRemove({
      variables: { projectId: queryVariables.projectId, serviceIds },
    });
  }, [clients, bulkRemove, queryVariables.projectId]);

  const disabledMessage =
    clientIdsToRemove.length > 0 && clientIdsToAssign.length > 0
      ? `To remove multiple services, please only select clients that are assigned on the specified date.`
      : null;

  return (
    <>
      <Stack direction='row' gap={2}>
        <LoadingButton
          onClick={handleAssign}
          disabled={clientIdsToAssign.length === 0}
          loading={loading.assign}
        >
          {numToEnroll > 0
            ? `Enroll (${numToEnroll}) + Assign (${clientIdsToAssign.length})`
            : `Assign (${clientIdsToAssign.length})`}
        </LoadingButton>
        <ButtonTooltipContainer title={disabledMessage}>
          <LoadingButton
            onClick={handleRemove}
            color='error'
            disabled={clientIdsToRemove.length === 0 || !!disabledMessage}
            loading={loading.remove}
          >
            {`Remove (${clientIdsToRemove.length})`}
          </LoadingButton>
        </ButtonTooltipContainer>
      </Stack>
      {apolloError && <ApolloErrorAlert error={apolloError} />}
    </>
  );
};

export default MultiAssignServiceButton;
