import UnitReferralStatus from '@/modules/ce/components/UnitReferralStatus';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import UnitOccupants from '@/modules/units/components/UnitOccupants';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  UnitTableRowFieldsFragment,
  GetUnitsQueryVariables,
  UnitOccupancyStatus,
  RelationshipToHoH,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const UNIT_COLUMNS: Record<
  string,
  DataColumnDef<UnitTableRowFieldsFragment, GetUnitsQueryVariables>
> = {
  unitType: {
    header: 'Unit Type',
    key: 'unitType',
    render: (unit: UnitTableRowFieldsFragment) => unit.unitType?.description,
    sticky: 'left',
  },
  unitId: {
    header: 'Unit ID',
    key: 'unitId',
    render: 'id',
  },
  unitGroup: {
    header: 'Unit Group',
    key: 'unitGroup',
    render: (unit: UnitTableRowFieldsFragment) => unit.unitGroup?.name || 'N/A',
  },
  unitOccupancyStatus: {
    header: 'Occupancy',
    key: 'occupancy',
    render: (unit: UnitTableRowFieldsFragment) =>
      unit.occupancyStatus === UnitOccupancyStatus.Occupied
        ? 'Occupied'
        : 'Vacant',
  },
  clientOccupants: {
    header: 'Client Occupants',
    key: 'clients',
    render: (unit: UnitTableRowFieldsFragment) => <UnitOccupants unit={unit} />,
    optional: {
      defaultHidden: true,
      queryVariableField:
        'includeClientOccupants' as keyof GetUnitsQueryVariables,
    },
  },
  ceReferralStatus: {
    header: 'Referral Status',
    key: 'referralStatus',
    render: (unit: UnitTableRowFieldsFragment) => (
      <UnitReferralStatus unit={unit} />
    ),
  },
};

export const getViewOccupantEnrollmentAction = (
  unit: UnitTableRowFieldsFragment
) => {
  // Unit Occupants is an optional column with conditional querying, so this action will only be available if the column is selected
  if (!unit.occupants || unit.occupants.length === 0) return;

  const occupant =
    unit.occupants.find(
      (e) => e.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    ) || unit.occupants[0];

  if (!occupant) return;

  return {
    title: 'View Enrollment',
    key: 'viewEnrollment',
    ariaLabel: `View Enrollment for ${clientBriefName(occupant.client)}`,
    to: generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
      clientId: occupant.client.id,
      enrollmentId: occupant.id,
    }),
  };
};
