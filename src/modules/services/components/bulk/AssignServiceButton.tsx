import CheckIcon from '@mui/icons-material/Check';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { LoadingButton } from '@mui/lab';
import { ButtonProps, DialogActions, DialogContent } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import { useCallback, useEffect, useMemo, useState } from 'react';

import * as React from 'react';
import { useBulkAssignMutations } from '../../hooks/useBulkAssignMutations';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';

import CommonDialog from '@/components/elements/CommonDialog';
import ClientAlertStack from '@/modules/client/components/clientAlerts/ClientAlertStack';
import useClientAlerts from '@/modules/client/hooks/useClientAlerts';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import FormActions from '@/modules/form/components/FormActions';
import { FormActionTypes } from '@/modules/form/types';
import {
  BulkAssignServiceInput,
  BulkServicesClientSearchQuery,
} from '@/types/gqlTypes';

interface Props {
  client: BulkServicesClientSearchQuery['clientSearch']['nodes'][0];
  queryVariables: Omit<BulkAssignServiceInput, 'clientIds'>;
  tableLoading?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  serviceTypeName: string;
}

const AssignServiceButton: React.FC<Props> = ({
  client,
  queryVariables,
  tableLoading,
  disabled,
  disabledReason,
  serviceTypeName,
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

  const { clientAlerts } = useClientAlerts({ client });
  const [clientAlertDialogOpen, setClientAlertDialogOpen] = useState(false);

  const onClick = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      e.stopPropagation();

      if (isAssignedOnDate) {
        const serviceIds =
          client.activeEnrollment?.services.nodes.map((s) => s.id) || [];

        bulkRemove({
          variables: { projectId: queryVariables.projectId, serviceIds },
          onCompleted: () => setLocalDisabled(true),
        });
      } else {
        if (clientAlerts.length > 0) {
          setClientAlertDialogOpen(true);
          return;
        }

        bulkAssign({
          variables: {
            input: {
              ...queryVariables,
              clientIds: [client.id],
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
      bulkAssign,
      queryVariables,
      clientAlerts.length,
    ]
  );

  const buttonText = useMemo(() => {
    if (localDisabled) return 'Reloading...';
    if (isAssignedOnDate) return 'Assigned';
    if (client.activeEnrollment) return 'Assign';
    return 'Enroll + Assign';
  }, [client.activeEnrollment, isAssignedOnDate, localDisabled]);

  const startIcon =
    isAssignedOnDate && !localDisabled ? (
      <CheckIcon />
    ) : clientAlerts.length > 0 ? (
      <WarningAmberRoundedIcon />
    ) : undefined;

  return (
    <>
      <ButtonTooltipContainer title={disabledReason} placement='top-start'>
        <LoadingButton
          onClick={onClick}
          loading={loading}
          disabled={disabled || localDisabled}
          startIcon={startIcon}
          fullWidth
          variant={isAssignedOnDate ? 'contained' : 'gray'}
        >
          {buttonText}
        </LoadingButton>
      </ButtonTooltipContainer>
      {apolloError && <ApolloErrorAlert error={apolloError} />}
      <CommonDialog fullWidth open={clientAlertDialogOpen}>
        <DialogTitle>
          {clientAlerts.length === 1 ? 'Client Alert' : 'Client Alerts'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <ClientAlertStack clientAlerts={clientAlerts} />
        </DialogContent>
        <DialogActions>
          <FormActions
            onDiscard={() => setClientAlertDialogOpen(false)}
            onSubmit={() => {
              bulkAssign({
                variables: {
                  input: {
                    ...queryVariables,
                    clientIds: [client.id],
                  },
                },
                onCompleted: () => setLocalDisabled(true),
              });
              setClientAlertDialogOpen(false);
            }}
            config={[
              {
                action: FormActionTypes.Discard,
                id: 'discard',
                label: `Cancel ${serviceTypeName}`,
                buttonProps: { variant: 'gray' },
              },
              {
                action: FormActionTypes.Submit,
                id: 'submit',
                label: `Add ${serviceTypeName}`,
              },
            ]}
          />
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default AssignServiceButton;
