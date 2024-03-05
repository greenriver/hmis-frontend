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
  // Internal loading state to display in the interface for this button
  const [loading, setLoading] = useState(false);
  // Locally disable the button while the table refetches, AFTER this specific mutation has completed
  const [localDisabled, setLocalDisabled] = useState(false);

  const isAssignedOnDate = useMemo(() => {
    if (!client.activeEnrollment) return false;
    return client.activeEnrollment.services.nodesCount > 0;
  }, [client]);

  // When the entire table has finished re-fetching, remove the loading state for this button.
  useEffect(() => {
    if (!tableLoading) setLocalDisabled(false);
  }, [tableLoading]);

  const handlers = useMemo(
    () => ({
      onCompleted: () => {
        setLoading(false);
        setLocalDisabled(true); // disabled while table refetches
      },
      onError: () => setLoading(false),
    }),
    []
  );

  const onClick = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      e.stopPropagation();

      if (isAssignedOnDate) {
        const serviceIds =
          client.activeEnrollment?.services.nodes.map((s) => s.id) || [];

        setLoading(true);
        bulkRemove({
          variables: { projectId, serviceIds },
          ...handlers,
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
          ...handlers,
        });
      }
    },
    [
      isAssignedOnDate,
      client,
      bulkRemove,
      projectId,
      handlers,
      bulkAssign,
      dateProvided,
      serviceTypeId,
      cocCode,
    ]
  );

  const buttonText = useMemo(() => {
    if (localDisabled) return 'Reloading...';
    if (isAssignedOnDate) return 'Assigned';
    if (client.activeEnrollment) return 'Assign';
    return 'Enroll + Assign';
  }, [client.activeEnrollment, isAssignedOnDate, localDisabled]);

  return (
    <LoadingButton
      onClick={onClick}
      loading={loading}
      disabled={disabled || localDisabled}
      startIcon={isAssignedOnDate && !localDisabled ? <CheckIcon /> : undefined}
      fullWidth
      variant={isAssignedOnDate ? 'contained' : 'gray'}
    >
      {buttonText}
    </LoadingButton>
  );
};

export default AssignServiceButton;
