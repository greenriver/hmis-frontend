import CheckIcon from '@mui/icons-material/Check';
import { LoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useBulkAssignMutations } from '../../hooks/useBulkAssignMutations';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { formatDateForGql } from '@/modules/hmis/hmisUtil';
import { BulkServicesClientSearchQuery } from '@/types/gqlTypes';

interface Props {
  client: BulkServicesClientSearchQuery['clientSearch']['nodes'][0];
  dateProvided: Date;
  projectId: string;
  serviceTypeId: string;
  tableLoading?: boolean;
  disabled?: boolean;
  cocCode?: string;
}

const AssignServiceButton: React.FC<Props> = ({
  client,
  dateProvided,
  projectId,
  serviceTypeId,
  tableLoading,
  disabled,
  cocCode,
}) => {
  const { bulkAssign, bulkRemove, loading, apolloError } =
    useBulkAssignMutations();

  // Locally disable the button while the table refetches, AFTER this specific mutation has completed
  const [localDisabled, setLocalDisabled] = useState(false);

  // When the entire table has finished re-fetching, remove the loading state for this button.
  useEffect(() => {
    if (!tableLoading) setLocalDisabled(false);
  }, [tableLoading]);

  // Whether this client already has a service of this type on this date
  const isAssignedOnDate = useMemo(() => {
    if (!client.activeEnrollment) return false;
    return client.activeEnrollment.services.nodesCount > 0;
  }, [client]);

  const onClick = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      e.stopPropagation();

      if (isAssignedOnDate) {
        const serviceIds =
          client.activeEnrollment?.services.nodes.map((s) => s.id) || [];

        bulkRemove({
          variables: { projectId, serviceIds },
          onCompleted: () => setLocalDisabled(true),
        });
      } else {
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
          onCompleted: () => setLocalDisabled(true),
        });
      }
    },
    [
      isAssignedOnDate,
      client,
      bulkRemove,
      projectId,
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
    <>
      <LoadingButton
        onClick={onClick}
        loading={loading}
        disabled={disabled || localDisabled}
        startIcon={
          isAssignedOnDate && !localDisabled ? <CheckIcon /> : undefined
        }
        fullWidth
        variant={isAssignedOnDate ? 'contained' : 'gray'}
      >
        {buttonText}
      </LoadingButton>
      {apolloError && <ApolloErrorAlert error={apolloError} />}
    </>
  );
};

export default AssignServiceButton;
