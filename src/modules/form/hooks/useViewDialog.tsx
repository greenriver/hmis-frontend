import { useCallback, useMemo, useState } from 'react';

import { SubmitFormAllowedTypes } from '../types';
import { DynamicFormHandlerArgs } from './useDynamicFormHandlersForRecord';
import ViewRecordDialog, {
  RecordDialogProps,
} from '@/modules/form/components/ViewRecordDialog';
import { FormRole } from '@/types/gqlTypes';

export type RenderFormDialogProps<T> = Omit<
  RecordDialogProps<T>,
  'open' | 'formRole' | 'record'
>;

interface Args<T> extends Omit<DynamicFormHandlerArgs<T>, 'formDefinition'> {
  formRole: FormRole;
  onClose?: VoidFunction;
}

export function useViewDialog<T extends SubmitFormAllowedTypes>({
  onClose,
  record,
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
            {...props}
            formRole={formRole}
            open={dialogOpen}
            onClose={onClose}
          />
        )}
      </>
    ),
    [onClose, record, dialogOpen, formRole]
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
