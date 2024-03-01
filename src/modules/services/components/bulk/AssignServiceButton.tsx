import CheckIcon from '@mui/icons-material/Check';
import { LoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { formatDateForGql } from '@/modules/hmis/hmisUtil';
import {
  BulkAssignServiceMutationFn,
  BulkRemoveServiceMutationFn,
  BulkServicesClientSearchQuery,
} from '@/types/gqlTypes';

interface Props {
  client: BulkServicesClientSearchQuery['clientSearch']['nodes'][0];
  dateProvided: Date;
  projectId: string;
  serviceTypeId: string;
  bulkAssign: BulkAssignServiceMutationFn;
  bulkRemove: BulkRemoveServiceMutationFn;
  tableLoading?: boolean;
  disabled?: boolean;
  cocCode?: string;
}

const AssignServiceButton: React.FC<Props> = ({
  client,
  dateProvided,
  projectId,
  serviceTypeId,
  bulkAssign,
  bulkRemove,
  tableLoading,
  disabled,
  cocCode,
}) => {
  // Internal loading state to display in the interface for this button.
  // We display as loading for the duration of two queries: (1) when the mutation
  // is being performed, and (2) when the table is re-fetching after that mutation succeeds.
  // This can cause the loading state to be present longer than necessary (if multiple buttons
  // are clicked in succession), but I think this is preferable than the alternative, which I
  // think would be an optimistic update to the button state (saying its assigned/unassigned) because
  // that would need to be disabled while refetch occurs. That causes a UI flash when moving quickly
  // in and out of the disabled state. (Could be fixed by disabling button without UI treatment - maybe revisit).
  const [loading, setLoading] = useState(false);

  const isAssignedOnDate = useMemo(() => {
    if (!client.activeEnrollment) return false;
    return client.activeEnrollment.services.nodesCount > 0;
  }, [client]);

  // When the entire table has finished re-fetching, remove the loading state for this button.
  useEffect(() => {
    if (!tableLoading) setLoading(false);
  }, [tableLoading]);

  const onClick = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      e.stopPropagation();

      if (isAssignedOnDate) {
        const serviceIds =
          client.activeEnrollment?.services.nodes.map((s) => s.id) || [];

        setLoading(true);
        bulkRemove({
          variables: { projectId, serviceIds },
          onError: () => setLoading(false),
        });
      } else {
        setLoading(true);
        bulkAssign({
          variables: {
            input: {
              projectId,
              clientIds: [client.id],
              dateProvided: formatDateForGql(dateProvided) || '',
              serviceTypeId,
              cocCode,
            },
          },
          onError: () => setLoading(false),
        });
      }
    },
    [
      bulkAssign,
      bulkRemove,
      client.activeEnrollment,
      client.id,
      dateProvided,
      cocCode,
      isAssignedOnDate,
      projectId,
      serviceTypeId,
    ]
  );

  const buttonText = useMemo(() => {
    if (isAssignedOnDate) return 'Assigned';
    if (client.activeEnrollment) return 'Assign';
    return 'Enroll + Assign';
  }, [client, isAssignedOnDate]);

  return (
    <LoadingButton
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      startIcon={isAssignedOnDate ? <CheckIcon /> : undefined}
      fullWidth
      variant={isAssignedOnDate ? 'contained' : 'gray'}
    >
      {buttonText}
    </LoadingButton>
  );
};

export default AssignServiceButton;
