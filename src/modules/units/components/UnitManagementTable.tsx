import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';
import pluralize from 'pluralize';
import { useCallback, useMemo } from 'react';

import UnitOccupants from './UnitOccupants';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { ColumnDef } from '@/components/elements/table/types';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  getInputTypeForRecordType,
  useFilters,
} from '@/modules/hmis/filterUtil';
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
        header: 'Unit Type',
        render: (unit) => unit.unitType?.description,
      },
      {
        header: 'Unit ID',
        render: 'id',
      },
      {
        header: 'Active Status',
        render: (unit) => (unit.occupants.length > 0 ? 'Filled' : 'Available'),
      },
      {
        header: 'Client(s)',
        render: (unit) => <UnitOccupants unit={unit} />,
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

  const filters = useFilters({
    type: getInputTypeForRecordType('Unit'),
  });

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
      selectable={allowDeleteUnits ? 'row' : undefined}
      isRowSelectable={(row) => row.occupants.length === 0}
      showTopToolbar
      filters={filters}
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
