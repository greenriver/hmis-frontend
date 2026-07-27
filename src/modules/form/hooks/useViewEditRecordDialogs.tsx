import { DocumentNode } from '@apollo/client';
import { Breakpoint, Button } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import { DynamicFormHandlerArgs } from '@/modules/form/hooks/useDynamicFormHandlersForRecord';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import useViewDialog from '@/modules/form/hooks/useViewDialog';
import { LocalConstants, SubmitFormAllowedTypes } from '@/modules/form/types';
import { RecordFormRole } from '@/types/gqlTypes';

interface Args<T> {
  variant: 'view_only' | 'edit_only' | 'view_and_edit';
  inputVariables?: DynamicFormHandlerArgs<T>['inputVariables'];
  formRole: RecordFormRole;
  recordName: string;
  deleteRecordDocument?: DocumentNode;
  deleteRecordIdPath?: string;
  evictCache?: VoidFunction;
  localConstants?: LocalConstants;
  maxWidth?: Breakpoint | false;
  projectId?: string; // Project context for fetching form definition
}

/**
 * Helper for dialogs for Viewing and Editing/Deleting records.
 * Only works for records that are submitted using SubmitForm.
 * Often used alongside a table component.
 */
export function useViewEditRecordDialogs<T extends SubmitFormAllowedTypes>({
  variant,
  inputVariables,
  formRole,
  recordName = 'Case Note',
  deleteRecordDocument,
  deleteRecordIdPath,
  evictCache = () => null,
  localConstants,
  projectId,
  maxWidth = 'md',
}: Args<T>) {
  const [viewingRecord, setViewingRecord] = useState<T | undefined>();

  const { openViewDialog, renderViewDialog, closeViewDialog } =
    useViewDialog<T>({
      record: viewingRecord,
      onClose: () => setViewingRecord(undefined),
      formRole,
      projectId,
    });

  const { openFormDialog, renderFormDialog, closeDialog } = useFormDialog<T>({
    formRole,
    onCompleted: () => {
      // only gets called on success
      if (!viewingRecord) evictCache(); // clear cache if new record was created
      setViewingRecord(undefined);
      closeViewDialog();
    },
    inputVariables,
    record: viewingRecord,
    localConstants,
    projectId,
    onClose: () => setViewingRecord(undefined),
  });

  const onSuccessfulDelete = useCallback(() => {
    evictCache();
    closeDialog();
    closeViewDialog();
    setViewingRecord(undefined);
  }, [closeDialog, closeViewDialog, evictCache]);

  const deleteButton = useMemo(
    () =>
      deleteRecordDocument &&
      deleteRecordIdPath &&
      viewingRecord && (
        <DeleteMutationButton
          recordName={recordName}
          queryDocument={deleteRecordDocument}
          idPath={deleteRecordIdPath}
          onSuccess={onSuccessfulDelete}
          variables={{ id: viewingRecord.id }}
        >
          Delete
        </DeleteMutationButton>
      ),
    [
      deleteRecordDocument,
      deleteRecordIdPath,
      onSuccessfulDelete,
      recordName,
      viewingRecord,
    ]
  );

  const viewRecordDialog = useCallback(() => {
    if (variant === 'edit_only') return null;

    return renderViewDialog({
      title: `View ${recordName}`,
      maxWidth,
      actions: (
        <>
          {viewingRecord && variant === 'view_and_edit' && (
            <>
              <Button variant='outlined' onClick={openFormDialog}>
                Edit
              </Button>
              {deleteButton}
            </>
          )}
        </>
      ),
    });
  }, [
    deleteButton,
    maxWidth,
    openFormDialog,
    recordName,
    renderViewDialog,
    variant,
    viewingRecord,
  ]);

  const editRecordDialog = useCallback(() => {
    if (variant === 'view_only') return null;

    return renderFormDialog({
      title: viewingRecord ? `Edit ${recordName}` : `Add ${recordName}`,
      DialogProps: { maxWidth },
      // If this is a direct-edit modal, show the delete button. If it's a view-and-edit, the delete button is on the view modal.
      otherActions: variant === 'edit_only' ? deleteButton : null,
    });
  }, [
    deleteButton,
    maxWidth,
    recordName,
    renderFormDialog,
    variant,
    viewingRecord,
  ]);

  const onSelectRecord = useCallback(
    (record: T) => {
      setViewingRecord(record);
      // Open Edit modal or View modal depending on variant
      if (variant === 'edit_only') {
        openFormDialog();
      } else {
        openViewDialog();
      }
    },
    [openFormDialog, openViewDialog, variant]
  );

  return {
    onSelectRecord,
    viewRecordDialog,
    editRecordDialog,
    onSuccessfulDelete,
    openFormDialog,
  };
}
