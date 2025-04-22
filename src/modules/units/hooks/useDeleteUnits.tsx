import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';
import pluralize from 'pluralize';
import { useCallback, useMemo, useState } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import DeleteMutationConfirmationDialog from '@/modules/dataFetching/components/DeleteMutationConfirmationDialog';
import { evictUnitsQuery } from '@/modules/units/util';
import {
  DeleteUnitsDocument,
  DeleteUnitsMutation,
  DeleteUnitsMutationVariables,
} from '@/types/gqlTypes';

export const useDeleteUnits = ({
  projectId,
}: {
  projectId: string;
}): {
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
      onSuccess: () => evictUnitsQuery(projectId),
    };
  }, [projectId]);

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
        <ButtonTooltipContainer
          title={
            disabled ? 'Currently assigned units can not be deleted' : null
          }
        >
          <DeleteMutationButton<
            DeleteUnitsMutation,
            DeleteUnitsMutationVariables
          >
            variables={{
              input: { unitIds },
            }}
            ButtonProps={{
              size: 'small',
              variant: 'text',
              color: 'info',
              disabled,
              'aria-label': 'Delete unit',
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
            <DeleteIcon
              sx={{ color: disabled ? 'text.disabled' : 'text.secondary' }}
            />
          </DeleteMutationButton>
        </ButtonTooltipContainer>
      );
    },
    [deleteDialogProps]
  );

  return { setUnitToDelete, renderSingleDeleteDialog, renderBulkDeleteButton };
};
