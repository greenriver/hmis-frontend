import { filter } from 'lodash-es';
import { useCallback, useMemo } from 'react';

import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { AlwaysPresentLocalConstants } from '@/modules/form/util/formUtil';
import {
  ClientFieldsFragment,
  ExternalIdentifierType,
  RecordFormRole,
  useGetClientQuery,
} from '@/types/gqlTypes';

export const localConstantsForClientForm = (
  client?: ClientFieldsFragment | null
) => {
  if (!client) {
    // For Client creation, allow the user to input SSN and DOB
    // even if they don't have read-access to those fields
    return {
      canViewFullSsn: true,
      canViewDob: true,
      ...AlwaysPresentLocalConstants,
    };
  }

  return {
    canViewDob: client.access.canViewDob,
    canViewFullSsn: client.access.canViewFullSsn,
    mciIds: filter(client.externalIds, {
      type: ExternalIdentifierType.MciId,
    }),
    ...AlwaysPresentLocalConstants,
  };
};

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

  const localConstants = useMemo(
    () => localConstantsForClientForm(client),
    [client]
  );

  const { openFormDialog, renderFormDialog } =
    useFormDialog<ClientFieldsFragment>({
      formRole: RecordFormRole.Client,
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
