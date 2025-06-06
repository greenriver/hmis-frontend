import { Typography } from '@mui/material';
import pluralize from 'pluralize';
import { useCallback, useMemo, useState } from 'react';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import DeleteMutationConfirmationDialog from '@/modules/dataFetching/components/DeleteMutationConfirmationDialog';
import {
  DeleteUnitsDocument,
  DeleteUnitsMutation,
  DeleteUnitsMutationVariables,
} from '@/types/gqlTypes';

type Args = {
  onSuccess?: () => void;
};

export const useDeleteUnits = ({
  onSuccess,
}: Args): {
  setUnitToDelete: (unitId: string) => void;
  renderSingleDeleteDialog: () => JSX.Element;
  renderBulkDeleteButton: (
    unitIds: string[],
    disabled?: boolean
  ) => JSX.Element;
} => {
  const deleteDialogProps = useMemo(() => {
    return {
      idPath: 'deleteUnits.unitIds[0]',
      recordName: 'unit',
      queryDocument: DeleteUnitsDocument,
      onSuccess,
    };
  }, [onSuccess]);

  const [unitToDelete, setUnitToDelete] = useState<string | undefined>(
    undefined
  );

  const renderSingleDeleteDialog = useCallback(() => {
    return (
      <DeleteMutationConfirmationDialog<
        DeleteUnitsMutation,
        DeleteUnitsMutationVariables
      >
        open={!!unitToDelete}
        onClose={() => setUnitToDelete(undefined)}
        variables={{
          input: { unitIds: [unitToDelete || ''] },
        }}
        {...deleteDialogProps}
      />
    );
  }, [deleteDialogProps, unitToDelete]);

  const renderBulkDeleteButton = useCallback(
    (unitIds: string[], disabled?: boolean) => {
      const pluralUnits = `${unitIds.length} ${pluralize(
        'unit',
        unitIds.length
      )}`;

      return (
        <DeleteMutationButton<DeleteUnitsMutation, DeleteUnitsMutationVariables>
          variables={{
            input: { unitIds },
          }}
          ButtonProps={{
            variant: 'contained',
            color: 'error',
            sx: { width: '100%' },
            disabled,
          }}
          confirmationDialogContent={
            <>
              <Typography>
                {`Are you sure you want to delete ${pluralUnits}?`}
              </Typography>
              <Typography>This action cannot be undone.</Typography>
            </>
          }
          ConfirmationDialogProps={{
            confirmText: `Yes, delete ${pluralUnits}`,
            title: 'Delete units',
          }}
          {...deleteDialogProps}
        >
          Delete ({unitIds.length})
        </DeleteMutationButton>
      );
    },
    [deleteDialogProps]
  );

  return { setUnitToDelete, renderSingleDeleteDialog, renderBulkDeleteButton };
};
