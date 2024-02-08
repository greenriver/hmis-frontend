import { useCallback, useMemo, useState } from 'react';

import { SubmitFormAllowedTypes } from '../types';
import { DynamicFormHandlerArgs } from './useDynamicFormHandlersForRecord';
import ViewRecordDialog, {
  RecordDialogProps,
} from '@/modules/form/components/ViewRecordDialog';
import { RecordFormRole } from '@/types/gqlTypes';

export type RenderFormDialogProps<T> = Omit<
  RecordDialogProps<T>,
  'open' | 'formRole' | 'record' | 'projectId'
>;

interface Args<T> extends Omit<DynamicFormHandlerArgs<T>, 'formDefinition'> {
  formRole: RecordFormRole;
  onClose?: VoidFunction;
  projectId?: string; // Project context for fetching form definition
}

export function useViewDialog<T extends SubmitFormAllowedTypes>({
  onClose,
  record,
  projectId,
  formRole,
}: Args<T>) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const openViewDialog = useCallback(() => setDialogOpen(true), []);
  const closeViewDialog = useCallback(() => setDialogOpen(false), []);

  const renderViewDialog = useCallback(
    ({ title, ...props }: RenderFormDialogProps<T>) => (
      <>
        {record && (
          <ViewRecordDialog<T>
            title={title}
            record={record}
            projectId={projectId}
            {...props}
            formRole={formRole}
            open={dialogOpen}
            onClose={onClose}
          />
        )}
      </>
    ),
    [record, projectId, formRole, dialogOpen, onClose]
  );

  return useMemo(
    () => ({
      renderViewDialog,
      openViewDialog,
      closeViewDialog,
    }),
    [renderViewDialog, openViewDialog, closeViewDialog]
  );
}

export default useViewDialog;
