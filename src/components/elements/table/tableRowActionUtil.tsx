import { ColumnDef } from '@/components/elements/table/types';
import { clientBriefName, entryExitRange } from '@/modules/hmis/hmisUtil';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import { ClientNameFragment, EnrollmentFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const BASE_ACTION_COLUMN_DEF: ColumnDef<any> = {
  key: 'Actions',
  tableCellProps: {
    sx: {
      py: 0,
      px: 0,
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
