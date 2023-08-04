import { useCallback, useMemo } from 'react';

import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { EnrollmentFieldsFragment, FormRole } from '@/types/gqlTypes';

/**
 * Form for creating AND enrolling a new client
 */
export function useNewClientEnrollmentFormDialog({
  onCompleted,
  projectId,
  householdId,
}: {
  projectId?: string;
  householdId?: string;
  onCompleted?: (data: EnrollmentFieldsFragment) => void;
}) {
  const localConstants = useMemo(
    () => ({
      canViewFullSsn: true,
      canViewDob: true,
      householdId,
    }),
    [householdId]
  );
  const inputVariables = useMemo(() => ({ projectId }), [projectId]);

  const { openFormDialog, renderFormDialog } =
    useFormDialog<EnrollmentFieldsFragment>({
      formRole: FormRole.NewClientEnrollment,
      onCompleted,
      localConstants,
      inputVariables,
    });

  const renderNewClientEnrollmentFormDialog = useCallback(() => {
    return renderFormDialog({
      title: 'Enroll a New Client',
      submitButtonText: 'Create & Enroll Client',
      DialogProps: { maxWidth: 'lg' },
      pickListArgs: { projectId },
    });
  }, [renderFormDialog, projectId]);

  return {
    openNewClientEnrollmentFormDialog: openFormDialog,
    renderNewClientEnrollmentFormDialog,
  } as const;
}
