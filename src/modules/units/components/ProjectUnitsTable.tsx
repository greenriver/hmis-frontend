import { useCallback, useMemo } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import {
  getViewOccupantEnrollmentAction,
  UNIT_COLUMNS,
} from '@/modules/units/columns/unitColumns';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitOccupancyStatus,
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  projectId: string;
  unitGroupsEnabled?: boolean; // whether to show Unit Groups functionality
  projectSupportsReferrals?: boolean; // whether to show CE details
}

// Table for displaying all Units in the Project. This table is read-only.
const ProjectUnitsTable: React.FC<Props> = ({
  projectId,
  unitGroupsEnabled = false,
  projectSupportsReferrals = false,
}) => {
  const columns: ColumnDef<UnitTableRowFieldsFragment>[] = useMemo(() => {
    return [
      UNIT_COLUMNS.unitType,
      UNIT_COLUMNS.unitId,
      ...(unitGroupsEnabled ? [UNIT_COLUMNS.unitGroup] : []),
      UNIT_COLUMNS.unitOccupancyStatus,
      UNIT_COLUMNS.clientOccupants,
      ...(projectSupportsReferrals ? [UNIT_COLUMNS.ceReferralStatus] : []),
    ];
  }, [unitGroupsEnabled, projectSupportsReferrals]);

  const filters = useFilters({
    type: 'UnitFilterOptions',
    omit: ['status'], // deprecated filter option, remove
    pickListArgs: { projectId },
  });

  const { project } = useProjectDashboardContext();

  const rowSecondaryActionConfigs = useCallback(
    (unit: UnitTableRowFieldsFragment) => {
      const actions = [];

      // Link to Unit Group
      if (unitGroupsEnabled && unit.unitGroup) {
        actions.push({
          title: 'View Unit Group',
          key: 'viewGroup',
          ariaLabel: `'View Unit Group' ${unit.unitGroup.name}`,
          to: generateSafePath(ProjectDashboardRoutes.UNIT_GROUP, {
            projectId: project.id,
            unitGroupId: unit.unitGroup.id,
          }),
        });
      }

      // If unit is occupied, link to hoh Enrollment
      const viewEnrollmentAction = getViewOccupantEnrollmentAction(unit);
      if (viewEnrollmentAction) {
        actions.push(viewEnrollmentAction);
      }

      return actions;
    },
    [unitGroupsEnabled, project.id]
  );

  const rowLinkToUnit = useCallback(
    (row: UnitTableRowFieldsFragment) =>
      generateSafePath(ProjectDashboardRoutes.UNIT, {
        projectId,
        unitId: row.id,
      }),
    [projectId]
  );

  return (
    <>
      <GenericTableWithData<
        GetUnitsQuery,
        GetUnitsQueryVariables,
        UnitTableRowFieldsFragment
      >
        defaultPageSize={25}
        queryVariables={{
          id: projectId,
          includeCeFields: projectSupportsReferrals,
        }}
        queryDocument={GetUnitsDocument}
        columns={columns}
        pagePath='project.units'
        noData='No units'
        isRowSelectable={(row) =>
          row.occupancyStatus === UnitOccupancyStatus.Vacant
        }
        filters={filters}
        recordType='Unit'
        rowName={(row) => `${row.unitType?.description} - ${row.id}`}
        rowSecondaryActionConfigs={rowSecondaryActionConfigs}
        loadingVariant='linear'
        // Only link to Unit page if project supports CE referrals. For now we don't have anything non-CE to show.
        rowLinkTo={projectSupportsReferrals ? rowLinkToUnit : undefined}
        rowActionTitle={projectSupportsReferrals ? 'View Unit' : undefined}
      />
    </>
  );
};
export default ProjectUnitsTable;
