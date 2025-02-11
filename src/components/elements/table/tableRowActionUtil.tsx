import { ColumnDef } from '@/components/elements/table/types';
import { clientBriefName, entryExitRange } from '@/modules/hmis/hmisUtil';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import { ClientNameFragment, EnrollmentFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const BASE_ACTION_COLUMN_DEF: ColumnDef<any> = {
  // Used in cases where we can't use the default table linking behavior (rowLinkTo OR handleRowClick OR rowSecondaryActionConfigs).
  // For example, when we want to pass a custom primaryAction to TableRowActions (BulkServices),
  // or when we take over rendering of an entire row using renderRow (ProjectHouseholdsTable).
  key: 'Actions',
  tableCellProps: {
    sx: {
      p: 1,
      whiteSpace: 'nowrap',
    },
  },
  render: '', // gets overridden when used
  sticky: 'right',
  width: '1%',
  dontLink: true,
};

export const getViewClientMenuItem = (client: ClientNameFragment) => {
  return {
    title: 'View Client',
    key: 'client',
    ariaLabel: `View Client, ${clientBriefName(client)}`,
    to: generateSafePath(ClientDashboardRoutes.PROFILE, {
      clientId: client.id,
    }),
  };
};

export const getViewEnrollmentMenuItem = (
  enrollment: Pick<EnrollmentFieldsFragment, 'id' | 'entryDate' | 'exitDate'>,
  client: ClientNameFragment
) => {
  return {
    title: 'View Enrollment',
    key: 'enrollment',
    ariaLabel: `View Enrollment, ${clientBriefName(client)} ${entryExitRange(enrollment)}`,
    to: generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
      clientId: client.id,
      enrollmentId: enrollment.id,
    }),
  };
};
