import { useCallback, useMemo } from 'react';

import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import {
  ClientFieldsFragment,
  FormRole,
  useGetClientQuery,
} from '@/types/gqlTypes';

/**
 * Form for creating or editing a client
 */
export function useClientFormDialog({
  clientId,
  onCompleted,
}: {
  clientId?: string;
  onCompleted?: (data: ClientFieldsFragment) => void;
}) {
  const {
    data: { client } = {},
    loading,
    error,
  } = useGetClientQuery({
    variables: { id: clientId || '' },
    skip: !clientId,
  });
  if (error) throw error;

  const localConstants = useMemo(() => {
    if (!clientId) {
      // For Client creation, allow the user to input SSN and DOB
      // even if they don't have read-access to those fields
      return { canViewFullSsn: true, canViewDob: true };
    }

    if (!client) return;
    const { canViewFullSsn, canViewDob } = client.access;
    return { canViewFullSsn, canViewDob };
  }, [clientId, client]);

  const { openFormDialog, renderFormDialog } =
    useFormDialog<ClientFieldsFragment>({
      formRole: FormRole.Client,
      onCompleted,
      localConstants,
      record: client,
    });

  const renderClientFormDialog = useCallback(() => {
    if (clientId && !client) return null;

    return renderFormDialog({
      title: client ? 'Update Client' : 'Add Client',
      submitButtonText: client ? 'Save Changes' : 'Create Client',
      DialogProps: { maxWidth: 'lg' },
    });
  }, [clientId, client, renderFormDialog]);
  return {
    openClientFormDialog: openFormDialog,
    renderClientFormDialog,
    clientLoading: loading && !client,
  } as const;
}
