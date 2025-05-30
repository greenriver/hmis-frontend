import { useCallback, useMemo } from 'react';
import UnitOccupants from './UnitOccupants';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { useUnitCeActions } from '@/modules/units/hooks/useUnitCeActions';
import { useUnitCeColumns } from '@/modules/units/hooks/useUnitCeColumns';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const UnitManagementTable = ({ projectId }: { projectId: string }) => {
  // TODO(7409) - instead of using the global permission, check project-level config
  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  const ceColumns = useUnitCeColumns();
  const columns: ColumnDef<UnitFieldsFragment>[] = useMemo(() => {
    return [
      {
        header: 'Unit Type',
        key: 'unitType',
        render: (unit) => unit.unitType?.description,
      },
      // {
      //   header: 'Unit Name',
      //   key: 'unitName',
      //   render: 'name',
      // },
      {
        header: 'Unit ID',
        key: 'unitId',
        render: 'id',
      },
      {
        header: 'Unit Group',
        key: 'unitGroup',
        render: (unit) => unit.unitGroup?.name || 'N/A',
      },
      {
        header: 'Occupancy',
        key: 'occupancy',
        render: (unit) => (unit.occupants.length > 0 ? 'Occupied' : 'Vacant'),
      },
      // {
      //   header: 'Client(s)',
      //   key: 'clients',
      //   render: (unit) => <UnitOccupants unit={unit} />,
      // },
      ...ceColumns,
    ];
  }, [ceColumns]);

  const filters = useFilters({
    type: 'UnitFilterOptions',
  });

  const { project } = useProjectDashboardContext();
  const { getCeActions, loading } = useUnitCeActions({ project });

  const rowSecondaryActionConfigs = useCallback(
    (unit: UnitFieldsFragment) => {
      return getCeActions(unit);
    },
    [getCeActions]
  );

  return (
    <>
      <GenericTableWithData<
        GetUnitsQuery,
        GetUnitsQueryVariables,
        UnitFieldsFragment
      >
        defaultPageSize={10}
        queryVariables={{
          id: projectId,
          includeCeFields: canViewCoordinatedEntry,
        }}
        queryDocument={GetUnitsDocument}
        columns={columns}
        pagePath='project.units'
        noData='No units'
        isRowSelectable={(row) => row.occupants.length === 0}
        filters={filters}
        recordType='Unit'
        rowName={(row) => `${row.unitType?.description} - ${row.id}`}
        rowSecondaryActionConfigs={rowSecondaryActionConfigs}
        loading={loading}
        loadingVariant='linear'
        // Only link to Unit page if CE is enabled. For now we don't have anything non-CE to show.
        rowLinkTo={
          canViewCoordinatedEntry
            ? (row) =>
                generateSafePath(ProjectDashboardRoutes.UNIT, {
                  projectId,
                  unitId: row.id,
                })
            : undefined
        }
        rowActionTitle={canViewCoordinatedEntry ? 'View Unit' : undefined}
      />
    </>
  );
};
export default UnitManagementTable;
