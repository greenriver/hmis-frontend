import { useCallback, useMemo } from 'react';

import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { ClientFieldsFragment, FormRole } from '@/types/gqlTypes';

/**
 * Form for creating AND enrolling a new client
 */
export function useNewClientEnrollmentFormDialog({
  onCompleted,
  projectId,
}: {
  projectId?: string;
  onCompleted?: (data: ClientFieldsFragment) => void;
}) {
  const localConstants = useMemo(() => {
    return { canViewFullSsn: true, canViewDob: true, householdId: null };
  }, []);

  const { openFormDialog, renderFormDialog } =
    useFormDialog<ClientFieldsFragment>({
      formRole: FormRole.NewClientEnrollment,
      onCompleted,
      localConstants,
      inputVariables: { projectId },
    });

  const renderClientFormDialog = useCallback(() => {
    return renderFormDialog({
      title: 'Enroll a New Client',
      submitButtonText: 'Create & Enroll Client',
      DialogProps: { maxWidth: 'lg' },
      pickListArgs: { projectId },
    });
  }, [renderFormDialog, projectId]);
  return {
    openClientFormDialog: openFormDialog,
    renderClientFormDialog,
  } as const;
}
