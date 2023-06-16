import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';
import pluralize from 'pluralize';
import { useCallback, useMemo } from 'react';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { ColumnDef } from '@/components/elements/GenericTable';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { evictUnitsQuery } from '@/modules/units/util';
import {
  DeleteUnitsDocument,
  DeleteUnitsMutation,
  DeleteUnitsMutationVariables,
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitFieldsFragment,
} from '@/types/gqlTypes';

const UnitManagementTable = ({
  projectId,
  allowDeleteUnits,
}: {
  projectId: string;
  allowDeleteUnits: boolean;
}) => {
  const renderDeleteButton = useCallback(
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
            idPath={'deleteUnits.unitIds[0]'}
            recordName='unit'
            queryDocument={DeleteUnitsDocument}
            onSuccess={() => evictUnitsQuery(projectId)}
            ButtonProps={{
              size: 'small',
              variant: 'text',
              color: 'info',
              disabled,
            }}
            confirmationDialogContent={
              unitIds.length > 1 ? (
                <>
                  <Typography>
                    {`Are you sure you want to delete ${pluralUnits}?`}
                  </Typography>
                  <Typography>This action cannot be undone.</Typography>
                </>
              ) : undefined
            }
            ConfirmationDialogProps={
              unitIds.length > 1
                ? {
                    confirmText: `Yes, delete ${pluralUnits}`,
                    title: 'Delete units',
                  }
                : undefined
            }
          >
            <DeleteIcon
              sx={{ color: disabled ? 'text.disabled' : 'text.secondary' }}
            />
          </DeleteMutationButton>
        </ButtonTooltipContainer>
      );
    },
    [projectId]
  );

  const columns: ColumnDef<UnitFieldsFragment>[] = useMemo(() => {
    return [
      {
        header: 'Unit ID',
        render: 'id',
      },
      {
        header: 'Unit Type',
        render: (unit) => unit.unitType?.description,
      },
      {
        header: 'Status',
        render: (unit) => (unit.occupants.length > 0 ? 'Filled' : 'Available'),
      },
      {
        header: 'Occupant',
        render: (unit) => unit.occupants.map((u) => clientBriefName(u.client)),
      },
      ...(allowDeleteUnits
        ? [
            {
              key: 'delete',
              width: '1%',
              dontLink: true,
              render: (unit: UnitFieldsFragment) =>
                renderDeleteButton([unit.id], unit.occupants.length > 0),
            },
          ]
        : []),
    ];
  }, [allowDeleteUnits, renderDeleteButton]);

  return (
    <GenericTableWithData<
      GetUnitsQuery,
      GetUnitsQueryVariables,
      UnitFieldsFragment
    >
      defaultPageSize={10}
      queryVariables={{ id: projectId }}
      queryDocument={GetUnitsDocument}
      columns={columns}
      pagePath='project.units'
      noData='No units'
      selectable={allowDeleteUnits}
      isRowSelectable={(row) => row.occupants.length === 0}
      showFilters
      recordType='Unit'
      EnhancedTableToolbarProps={{
        title: 'Unit Management',
        renderBulkAction: allowDeleteUnits
          ? (selectedUnitIds) => (
              <ButtonTooltipContainer title='Delete Selected Units'>
                {renderDeleteButton(selectedUnitIds as string[])}
              </ButtonTooltipContainer>
            )
          : undefined,
      }}
    />
  );
};
export default UnitManagementTable;
